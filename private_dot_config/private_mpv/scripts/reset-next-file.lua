local reset_options = { "pause" }
local keep_options = {
    ["aid"] = true,
    ["sid"] = true,
    ["secondary-sid"] = true,
    ["volume"] = true,
}

for _, option in ipairs(mp.get_property_native("watch-later-options")) do
    if not keep_options[option] then
        reset_options[#reset_options + 1] = option
    end
end

mp.set_property_native("reset-on-next-file", reset_options)
