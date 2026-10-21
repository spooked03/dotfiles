if status is-interactive
    # Commands to run in interactive sessions can go here
end

zoxide init fish | source
fzf --fish | source

alias yay="paru"
alias nano="micro"
alias s="kitten ssh"

alias ls='lsd'
alias l='lsd -l'
alias la='lsd -a'
alias lla='lsd -la'
alias lt='lsd --tree'

set -g fish_greeting
set -gx EDITOR micro

#alias ff="fd | fzf --preview 'bat --color=always --style=numbers {}'"
function ff
  set -l selection (fd --type f --print0 $argv | fzf --read0 --print0 --scheme=path --with-shell 'fish --no-config -c' \
    --preview 'bat --color=always --style=numbers --line-range :300 -- {}' \
    --header 'Enter: open | Ctrl-Y: copy path | Alt-Enter: cd to folder' \
    --bind 'ctrl-y:execute-silent(printf %s (realpath --zero -- {} | string split0) | wl-copy)' \
    --bind 'enter:become(micro -- {})' --expect alt-enter | string split0)
  if test "$selection[1]" = alt-enter; and set -q selection[2]
    cd -- (path dirname -- $selection[2])
  end
end

function fr --description 'Interactively search file contents'
  set -l selection (rg --with-filename --line-number --no-heading --color=always -- . $argv | fzf \
    --ansi --print0 --delimiter : --nth 3.. --with-shell 'fish --no-config -c' \
    --header 'Ctrl-Y: copy path | Alt-Enter: cd to folder' \
    --bind 'ctrl-y:execute-silent(printf %s (realpath --zero -- {1} | string split0) | wl-copy)' \
    --preview 'rg --line-number --no-heading --color=always --smart-case --fixed-strings --passthru -- {q} {1}' \
    --preview-window 'right,60%,+{2}-/2' --expect alt-enter | string split0)
  if test "$selection[1]" = alt-enter; and set -q selection[2]
    set -l match (string split --max 1 : -- $selection[2])
    cd -- (path dirname -- $match[1])
  else if set -q selection[2]
    printf '%s\n' $selection[2]
  end
end

#function unsloth
#    fish_add_path /home/sietse/.unsloth/studio/unsloth_studio/bin
#end

set -gx PATH /opt/cuda/bin $PATH
set -gx LD_LIBRARY_PATH /opt/cuda/lib64 $LD_LIBRARY_PATH

function unsloth
    /home/sietse/.unsloth/studio/unsloth_studio/bin/unsloth $argv
end
