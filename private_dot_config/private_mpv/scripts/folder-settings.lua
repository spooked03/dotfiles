-- Persist volume and track choices per local media directory, across mpv runs.
-- State: $XDG_STATE_HOME/mpv/folder-settings (or ~/.local/state/mpv/...).
local mp = require "mp"
local utils = require "mp.utils"
local msg = require "mp.msg"

local state_home = os.getenv("XDG_STATE_HOME")
if not state_home or state_home == "" then
    state_home = utils.join_path(os.getenv("HOME"), ".local/state")
end
local state_dir = utils.join_path(state_home, "mpv/folder-settings")
local properties = { "volume", "aid", "sid", "secondary-sid" }
local current, baseline, active = nil, {}, false
local dirty = false

local function subprocess(args, input)
    local result = mp.command_native({
        name = "subprocess", args = args, stdin_data = input,
        capture_stdout = true, capture_stderr = true, playback_only = false,
    })
    if result and result.status == 0 then return result.stdout end
    msg.error("Folder settings: subprocess failed: " .. args[1])
end

local function save()
    if not current or not dirty then return end
    -- One file per folder avoids different mpv instances overwriting other folders.
    local temp = current.file .. "." .. tostring(mp.get_property_native("pid")) .. ".tmp"
    local file, err = io.open(temp, "w")
    if not file then msg.error("Cannot save folder settings: " .. tostring(err)); return end
    local ok, write_err = file:write(utils.format_json(current.settings) .. "\n")
    local closed, close_err = file:close()
    if not ok or not closed then
        msg.error("Cannot write folder settings: " .. tostring(write_err or close_err))
        os.remove(temp)
        return
    end
    local renamed, rename_err = os.rename(temp, current.file)
    if not renamed then
        msg.error("Cannot replace folder settings: " .. tostring(rename_err))
        os.remove(temp)
        return
    end
    dirty = false
end

local timer = mp.add_timeout(0.3, save)
timer:kill()

local function track_choice(property, value)
    local tracks = mp.get_property_native("track-list", {})
    local track_type = property == "aid" and "audio" or "sub"
    if value == false or value == "no" then
        -- No stream is not a deliberate choice to disable streams in later files.
        for _, track in ipairs(tracks) do
            if track.type == track_type then return { disabled = true } end
        end
        return nil
    end
    for _, track in ipairs(tracks) do
        if track.id == tonumber(value) and
            track.type == track_type then
            return {
                id = track.id, lang = track.lang, title = track.title,
                external = track.external or false,
                codec = track.codec,
                hearing_impaired = track["hearing-impaired"] or false,
                forced = track.forced or false,
            }
        end
    end
end

local function select_track(property, choice)
    if type(choice) ~= "table" then return end
    if choice.disabled then mp.set_property(property, "no"); return end
    local best, best_score
    for _, track in ipairs(mp.get_property_native("track-list", {})) do
        if track.type == (property == "aid" and "audio" or "sub") then
            local score = 0
            -- Language outranks numeric IDs; titles distinguish full/forced/SDH.
            if choice.lang and track.lang == choice.lang then score = score + 100 end
            if choice.title and track.title == choice.title then score = score + 60 end
            if (track.external or false) == choice.external then score = score + 10 end
            if (track["hearing-impaired"] or false) == choice.hearing_impaired then score = score + 5 end
            if (track.forced or false) == choice.forced then score = score + 5 end
            if choice.codec and track.codec == choice.codec then score = score + 2 end
            if track.id == choice.id then score = score + 1 end
            -- Never substitute a different language when a saved language is absent.
            if (not choice.lang or track.lang == choice.lang) and
                (not best_score or score > best_score) then
                best, best_score = track.id, score
            end
        end
    end
    if best then mp.set_property_native(property, best) end
end

mp.add_hook("on_preloaded", 50, function()
    active = false
    timer:kill()
    save()
    current, baseline = nil, {}
    local path = mp.get_property("path", "")
    if path == "" or path == "-" or path:match("^%a[%w+.-]*://") then return end
    if path:sub(1, 1) ~= "/" then
        path = utils.join_path(mp.get_property("working-directory"), path)
    end
    local directory = utils.split_path(path)
    local canonical = subprocess({ "realpath", "-m", "--", directory })
    if not canonical then return end
    directory = canonical:gsub("\n$", "")
    local hash = subprocess({ "sha256sum" }, directory)
    if not hash then return end
    if not subprocess({ "mkdir", "-p", "--", state_dir }) then return end
    local filename = utils.join_path(state_dir, hash:match("^%x+") .. ".json")
    local settings = { directory = directory }
    local file = io.open(filename, "r")
    if file then
        local decoded = utils.parse_json(file:read("*a"))
        file:close()
        if type(decoded) == "table" and decoded.directory == directory then
            settings = decoded
        else
            msg.warn("Ignoring invalid folder settings: " .. filename)
        end
    end
    current = { file = filename, settings = settings }
    dirty = false
    if type(settings.volume) == "number" then
        mp.set_property_native("volume", settings.volume)
    end
    for _, property in ipairs({ "aid", "sid", "secondary-sid" }) do
        select_track(property, settings[property])
    end
end)

mp.register_event("file-loaded", function()
    if not current then return end
    for _, property in ipairs(properties) do
        local value = mp.get_property_native(property)
        baseline[property] = value
        if current.settings[property] == nil then
            current.settings[property] = property == "volume" and value or track_choice(property, value)
            dirty = true
        end
    end
    active = true
    save()
end)

for _, property in ipairs(properties) do
    mp.observe_property(property, "native", function(_, value)
        if not active or not current or baseline[property] == value then return end
        baseline[property] = value
        local choice = property == "volume" and value or track_choice(property, value)
        if choice == nil then return end
        current.settings[property] = choice
        dirty = true
        timer:kill()
        timer:resume()
    end)
end

mp.add_hook("on_unload", 50, function()
    active = false
    timer:kill()
    save()
end)
mp.register_event("shutdown", save)
