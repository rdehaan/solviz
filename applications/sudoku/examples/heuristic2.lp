#const k=3.
index(1..k*k).
value(U) :- index(U).

% There is exactly one value in each cell
1 { solution(R,C,U) : value(U) } 1 :- index(R), index(C).
% Each value appears exactly once in each row
1 { solution(R,C,U) : index(C) } 1 :- index(R), value(U).
% Each value appears exactly once in each column
1 { solution(R,C,U) : index(R) } 1 :- index(C), value(U).

% Each value appears at most once in each block
block_index(I,B) :- index(I), B = (I-1) / k.
same_block(I1,I2) :-
    index(I1), index(I2), block_index(I1,B), block_index(I2,B).
:- same_block(R1,R2), same_block(C1,C2), R1 != R2,
    solution(R1,C1,U), solution(R2,C2,U), value(U).
:- same_block(R1,R2), same_block(C1,C2), C1 != C2,
    solution(R1,C1,U), solution(R2,C2,U), value(U).

#show solution/3.

% Branch on negative atoms first
#heuristic solution(R,C,U) : index(R), index(C), index(U). [10,false]
