#!/bin/bash

cat account_plan.csv | tail -n +2 | sed -E 's/\r//g; s/^.*"([0-9]+)";"([^"]*)";"([^"]*)";.*/\1;\2;\3/g' | jq -Rsn '
[inputs
  | . / "\n"
  | (.[] | select(length > 0) | . / ";") as $input
  | {"account_number": ($input[0] | tonumber? // $input[0]), "name": $input[1], "account_type": $input[2]}
]' > account_plan.json


cat "$1" | tail -n +2 | sed '1!G;h;$!d' | awk 'BEGIN{Num=0}{print Num++ ";" $0}' | jq -Rsn '
def cap:
  [splits("[, \t]") | select(length > 0)]
  | map((.[:1]|ascii_upcase) + (.[1:]|ascii_downcase | gsub("É"; "é") | gsub("Å"; "å") | gsub("Ä"; "ä") | gsub("Ö"; "ö")))
  | join(" ");

[inputs
  | . / "\n"
  | (.[] | select(length > 0) | . / ";") as $input
  | ($input[2] | gsub(","; ".") | tonumber? // $input[2]) as $amount
  | {"id": $input[0], "date": $input[1] | gsub("/"; "-"), "amount": $amount, "sender": $input[3], "receiver": $input[4], "name": $input[5] | cap, "more_details": $input[6] | cap, "message": $input[7] | cap, "notes": $input[8], "account_balance": ($input[9] | sub(","; ".") | tonumber? // null), "currency": $input[10], "type": $input[12], "category": (if $amount < 0 then "negative" else "positive" end)}
]' > plusgiro.json

jq -s 'flatten | group_by(.id) | map(reduce .[] as $x ({}; . * $x)) | sort_by((.id | tonumber?) // .id)' plusgiro.json accounting.json > bookkeeping.json
