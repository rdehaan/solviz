#const k=3.
index(1..k*k).
value(U) :- index(U).

% Introduce propositional variables for each cell/value.
{ solution(R,C,U) } :- index(R), index(C), value(U).

% There is at least one value in each cell
:- index(R), index(C),
    not solution(R,C,U) : value(U).
% There is at most one value in each cell
:- index(R), index(C), value(U1), value(U2), U1 != U2,
    solution(R,C,U1), solution(R,C,U2).

% Each value appears at most once in each row
:- index(R), index(C1), index(C2), value(U), C1 != C2,
    solution(R,C1,U), solution(R,C2,U).

% Each value appears at most once in each column
:- index(R1), index(R2), index(C), value(U), R1 != R2,
    solution(R1,C,U), solution(R2,C,U).

block_index(I,B) :- index(I), B = (I-1) / k.
same_block(I1,I2) :-
    index(I1), index(I2), block_index(I1,B), block_index(I2,B).
% Each value appears at most once in each block
:- same_block(R1,R2), same_block(C1,C2), (R1,C1) != (R2,C2), value(U),
    solution(R1,C1,U), solution(R2,C2,U).

#show solution/3.
