#const k=3.
index(1..k*k).
block_index(0..k-1).
value(U) :- index(U).

% There is exactly one value in each cell
1 { solution(R,C,U) : value(U) } 1 :- index(R), index(C).

% A value may not appear twice in a row
conflict1(R,U) :-
    value(U), index(R), solution(R,C1,U), solution(R,C2,U), C1 != C2.
conflict2(R,U) :-
    value(U), index(R), solution(R,C1,U), solution(R,C2,U), C1 != C2.
:- conflict1(R,U), conflict2(R,U).

% A value may not appear twice in a column
conflict3(C,U) :-
    value(U), index(C), solution(R1,C,U), solution(R2,C,U), R1 != R2.
conflict4(C,U) :-
    value(U), index(C), solution(R1,C,U), solution(R2,C,U), R1 != R2.
:- conflict3(C,U), conflict4(C,U).

% A value may not appear twice in a block
block_index(I,B) :- index(I), B = (I-1) / k.
cell_in_block(R,C,BR,BC) :-
    index(R), block_index(R,BR),
    index(C), block_index(C,BC).
conflict5(BR,BC,U) :-
    value(U), cell_in_block(R1,C1,BR,BC), cell_in_block(R2,C2,BR,BC),
    solution(R1,C1,U), solution(R2,C2,U), (R1,C1) != (R2,C2).
conflict6(BR,BC,U) :-
    value(U), cell_in_block(R1,C1,BR,BC), cell_in_block(R2,C2,BR,BC),
    solution(R1,C1,U), solution(R2,C2,U), (R1,C1) != (R2,C2).
:- conflict5(BR,BC,U), conflict6(BR,BC,U).

% Branch in order of cells from left to right, top to bottom
#heuristic solution(R,C,U) : index(R), index(C), value(U). [(1000-100*R+100-10*C+10-U),true]

#show solution/3.
