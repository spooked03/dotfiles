if status is-interactive
    # Commands to run in interactive sessions can go here
end

set -g fish_greeting
zoxide init fish | source
fzf --fish | source

alias yay="paru"
alias nano="micro"
