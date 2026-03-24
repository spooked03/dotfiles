if status is-interactive
    # Commands to run in interactive sessions can go here
end

zoxide init fish | source
fzf --fish | source

alias yay="paru"
alias nano="micro"

set -g fish_greeting
set -gx EDITOR micro

#alias ff="fd | fzf --preview 'bat --color=always --style=numbers {}'"
function ff
  fd $argv | fzf --preview 'bat --color=always --style=numbers {}'
end


# Added by LM Studio CLI (lms)
set -gx PATH $PATH /home/nessie/.lmstudio/bin
# End of LM Studio CLI section

