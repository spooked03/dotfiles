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
  fd $argv | fzf --preview 'bat --color=always --style=numbers {}'
end

function fr --description 'Interactively search file contents'
  set -l paths (string join ' ' -- (string escape -- $argv))
  set -l search 'rg --with-filename --line-number --no-heading --color=always --smart-case --fixed-strings'
  rg --with-filename --line-number --no-heading --color=always -- . $argv | fzf \
    --ansi --disabled --delimiter : --nth 3.. \
    --bind "change:reload:$search -- {q} $paths || true" \
    --preview 'rg --line-number --no-heading --color=always --smart-case --fixed-strings --passthru -- {q} {1}' \
    --preview-window 'right,60%,+{2}-/2'
end

set -gx PATH /opt/cuda/bin $PATH
set -gx LD_LIBRARY_PATH /opt/cuda/lib64 $LD_LIBRARY_PATH
