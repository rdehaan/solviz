#const k=3.
index(1..k*k).
block_index(0..k-1).
value(U) :- index(U).

% There is exactly one value in each cell
1 { solution(R,C,U) : value(U) } 1 :- index(R), index(C).

% Each value appears somewhere in each row
:- value(U), index(R), not solution(R,C,U) : index(C).
% Each value appears somewhere in each column
:- value(U), index(C), not solution(R,C,U) : index(R).

% Each value appears somewhere in each block
block_index(I,B) :- index(I), B = (I-1) / k.
cell_in_block(R,C,BR,BC) :-
    index(R), block_index(R,BR),
    index(C), block_index(C,BC).
:- value(U), block_index(BR), block_index(BC),
    not solution(R,C,U) : cell_in_block(R,C,BR,BC).

#show solution/3.
