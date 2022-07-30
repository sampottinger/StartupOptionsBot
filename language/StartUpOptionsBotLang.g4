grammar StartUpOptionsBotLang;

WHITE_SPACE: [ \u000B\t\r\n] -> channel(HIDDEN);

COLON_: ':';

EQ_: '=';

START_CASES_: '{';

END_CASES_: '}';

START_PARAMS_: '(';

END_PARAMS_: ')';

COMMA_: ',';

DASH_: '-';

PERCENT_: '%';

MONTHS_: 'm' 'o' 'n' 't' 'h' 's';

FMV_: 'f' 'm' 'v';

SHARE_: 's' 'h' 'a' 'r' 'e';

TOTAL_: 't' 'o' 't' 'a' 'l';

OR_: '|';

START_VARS_: '[';

END_VARS_: ']';

FAIL_: 'f' 'a' 'i' 'l';

IPO_: 'i' 'p' 'o';

SELL_: 's' 'e' 'l' 'l';

RAISE_: 'r' 'a' 'i' 's' 'e';

BUY_: 'b' 'u' 'y';

QUIT_: 'q' 'u' 'i' 't';

FLOAT_: [0-9]+ '.' [0-9]+;

INTEGER_: [0-9]+;

ELSE_: 'e' 'l' 's' 'e';

COMPANY_: 'c' '_';

EMPLOYEE_: 'e' '_';

NAME_: [a-zA-Z]+;

number: (INTEGER_ | FLOAT_);

fail: FAIL_ START_PARAMS_ END_PARAMS_;

units: (SHARE_ | TOTAL_);

ipo: IPO_ START_PARAMS_ low=number DASH_ high=number unit=units END_PARAMS_;

sell: SELL_ START_PARAMS_ low=number DASH_ high=number unit=units END_PARAMS_;

raise: RAISE_ START_PARAMS_ vlow=number DASH_ vhigh=number FMV_ COMMA_ dilutelow=number DASH_ dilutehigh=number PERCENT_ COMMA_ delaylow=number DASH_ delayhigh=number MONTHS_ COMMA_ next=branches END_PARAMS_;

quit: QUIT_ START_PARAMS_ END_PARAMS_;

buy: BUY_ START_PARAMS_ amount=number PERCENT_ END_PARAMS_;

event: (fail | ipo | sell | raise | quit | buy);

actor: (COMPANY_ | EMPLOYEE_);

probval: (number | ELSE_);

probability: target=actor value=probval;

branch: chance=probability COLON_ target=event;

branches: START_CASES_ branch (OR_ branch)* END_CASES_;

name: NAME_;

assignment: target=name EQ_ value=number;

assignments: START_VARS_ assignment* END_VARS_;

program: header=assignments body=branches;
