if status is-interactive
    # Commands to run in interactive sessions can go here
end

zoxide init fish | source
fzf --fish | source

alias yay="paru"
alias nano="micro"
alias s="kitten ssh"

set -g fish_greeting
set -gx EDITOR micro

#alias ff="fd | fzf --preview 'bat --color=always --style=numbers {}'"
function ff
  fd $argv | fzf --preview 'bat --color=always --style=numbers {}'
end

set -gx PATH /opt/cuda/bin $PATH
set -gx LD_LIBRARY_PATH /opt/cuda/lib64 $LD_LIBRARY_PATH
