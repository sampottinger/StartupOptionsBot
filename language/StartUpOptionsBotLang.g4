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

QUIT_: 'q' 'u' 'i' 't';

FLOAT_: [0-9]+ '.' [0-9]+;

INTEGER_: [0-9]+;

ELSE_: 'e' 'l' 's' 'e';

NAME_: [a-z]+;

number: (INTEGER_ | FLOAT_);

fail: FAIL_ START_PARAMS_ END_PARAMS_;

quit: QUIT_ START_PARAMS_ END_PARAMS_;

ipo: IPO_ START_PARAMS_ low=number COMMA_ high=number END_PARAMS_;

sell: SELL_ START_PARAMS_ low=number COMMA_ high=number END_PARAMS_;

raise: RAISE_ START_PARAMS_ low=number COMMA_ high=number COMMA_ next=cases END_PARAMS_;

event: (fail | ipo | sell | raise | quit);

case: probability:(number | ELSE_) COLON_ target:event;

cases: START_CASES_ case (OR_ case)* END_CASES_;

var: name=(NAME_) EQ_ number;

vars: START_VARS_ var* END_VARS_;
