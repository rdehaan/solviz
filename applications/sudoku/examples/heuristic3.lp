#const k=3.
index(1..k*k).
block_index(0..k-1).
value(U) :- index(U).

% There is exactly one value in each cell
1 { solution(R,C,U) : value(U) } 1 :- index(R), index(C).
% Each value appears exactly once in each row
1 { solution(R,C,U) : index(C) } 1 :- index(R), value(U).
% Each value appears exactly once in each column
1 { solution(R,C,U) : index(R) } 1 :- index(C), value(U).

% Each value appears exactly once in each block
block_index(I, B) :- index(I), B = (I-1) / k.
1 { solution(R,C,U) : index(R), index(C),
    block_index(R,BR), block_index(C,BC) } 1 :-
        block_index(BR), block_index(BC), value(U).

#show solution/3.

% Branch on positive atoms first
#heuristic solution(R,C,U) : index(R), index(C), index(U). [10,true]
