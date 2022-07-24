grammar StartUpOptionsBotLang;

WHITE_SPACE: [ \u000B\t\r\n] -> channel(HIDDEN);

COLON_: ':';

EQ_: '=';

START_CASES_: '{';

END_CASES_: '}';

START_PARAMS_: '(';

END_PARAMS_: ')';

COMMA_: ',';

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

COMPANY_: 'c' '.';

EMPLOYEE_: 'e' '.';

NAME_: [a-z]+;

number: (INTEGER_ | FLOAT_);

fail: FAIL_ START_PARAMS_ END_PARAMS_;

ipo: IPO_ START_PARAMS_ low=number COMMA_ high=number END_PARAMS_;

sell: SELL_ START_PARAMS_ low=number COMMA_ high=number END_PARAMS_;

raise: RAISE_ START_PARAMS_ vlow=number COMMA_ vhigh=number COMMA dilutelow=number COMMA_ dilutehigh=number COMMA_ next=branches END_PARAMS_;

quit: QUIT_ START_PARAMS_ END_PARAMS_;

buy: BUY_ START_PARAMS_ amount=number END_PARAMS_;

event: (fail | ipo | sell | raise | quit | buy);

actor: (COMPANY_ | EMPLOYEE_);

probval: (number | ELSE_);

probability: target=actor value=probval;

branch: chance=probability COLON_ target=event;

branches: START_CASES_ branch (OR_ branch)* END_CASES_;

assignment: NAME_ EQ_ value=number;

assignments: START_VARS_ assignment* END_VARS_;

program: assignments branches;
