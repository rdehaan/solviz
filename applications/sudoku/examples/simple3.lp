#const k=3.
index(1..k*k).
value(U) :- index(U).

% There is exactly one value in each cell
1 { solution(R,C,U) : value(U) } 1 :- index(R), index(C).

% A value may not appear twice in a row
:- value(U), index(R), solution(R,C1,U), solution(R,C2,U), C1 != C2.
% A value may not appear twice in a column
:- value(U), index(C), solution(R1,C,U), solution(R2,C,U), R1 != R2.

% A value may not appear twice in a block
block_index(I,B) :- index(I), B = (I-1) / k.
cell_in_block(R,C,BR,BC) :-
    index(R), block_index(R,BR),
    index(C), block_index(C,BC).
:- value(U), cell_in_block(R1,C1,BR,BC), cell_in_block(R2,C2,BR,BC),
    solution(R1,C1,U), solution(R2,C2,U), (R1,C1) != (R2,C2).

#show solution/3.
