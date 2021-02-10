#!/bin/bash

# suggest use ssh to push, as https need username and passwprd everytime.

# ===================
# functions
# ------------------

function checkHeadSyncStatus()
{
    local branch=$1
    local remote=$2
    LOCAL=$(git rev-parse $branch)
    REMOTE=$(git rev-parse $remote/$branch)
    BASE=$(git merge-base $branch $remote/$branch)

    if [ $LOCAL = $REMOTE ]; then
        echo "Up-to-date"
    elif [ $LOCAL = $BASE ]; then
        echo "Need to pull"
    elif [ $REMOTE = $BASE ]; then
        echo "Need to push"
    else
        echo "Diverged"
    fi
}


# ===================
# read arguments
# ------------------
usage="$(basename "$0") [-h] [-b branch name] -- script to sync local branch with mutiple remotes

where:
    -h  show this help text
    -b  set the branch need to push (default master)"

aimsBRANCH="master"
while getopts ':hb:' option; do
  case "$option" in
    h) echo "$usage"
       exit
       ;;
    b) aimsBRANCH=$OPTARG
       ;;
    :) printf "| ERROR : missing argument for -%s\n" "$OPTARG" >&2
       echo "$usage" >&2
       exit 1
       ;;
   \?) printf "| ERROR : illegal option: -%s\n" "$OPTARG" >&2
       echo "$usage" >&2
       exit 1
       ;;
  esac
done
shift $((OPTIND - 1))


# ===================
# start to run
# ------------------
echo '| will push to branch : <' $aimsBRANCH '>'

currentBRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$currentBRANCH" != "$aimsBRANCH" ]]; then
  echo '| ERROR : head at branch : <' $currentBRANCH '>, not at <' $aimsBRANCH '>. Please checkout firstly.'
  exit 1;
fi

for remote in $(git remote);
do
    echo '|------'
    echo '| remote [' $remote ']'
    status=$(checkHeadSyncStatus $aimsBRANCH $remote)
    echo '| status : ' $status

    if [[ $status == 'Up-to-date' ]]; then
        echo '| skip...'
    elif [[ $status == 'Need to push' ]]; then
        echo '|- pushing to [' $remote ']...'
        git push $remote $aimsBRANCH
    elif [[ $status == 'Need to pull' ]]; then
        echo '| please pull firstly'
    else
        echo '| ERROR'
    fi

done

echo 'done'
