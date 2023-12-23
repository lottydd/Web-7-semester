"use strict";


//Поле

class Field {
    #className;//цвет
    #type; //поле с фигурой или нет

    constructor(className, type) {
        this.#className = className;
        this.#type = type;
    }

    getClassName() {
        return this.#className;
    }

    getType() {
        return this.#type;
    }
}
//Фигура
class Piece extends Field {
    #imgSrc; //откуда взята фигура
    #pieceColor; //цвет

    constructor(className, type, imgSrc, pieceColor) {
        super(className, type);
        this.#imgSrc = imgSrc;
        this.#pieceColor = pieceColor;
    }

    getImgSrc() {
        return this.#imgSrc;
    }

    getPieceColor() {
        return this.#pieceColor;
    }
}

//Ход на игровой доске

class Move {
    #fromFieldId; //Начальное поле
    #toFieldId; // Конечное поле
    #type; // Тип передвижения (рубим или нет)
    #movedPiece; // какая фигура ходит

    constructor(fromFieldId, toFieldId, type, movedPiece) {
        this.#fromFieldId = fromFieldId;
        this.#toFieldId = toFieldId;
        this.#type = type;
        this.#movedPiece = movedPiece;
    }

    getFromFieldId() {
        return this.#fromFieldId;
    }

    getToFieldId() {
        return this.#toFieldId;
    }

    getType() {
        return this.#type;
    }

    getMovedPiece() {
        return this.#movedPiece;
    }
}

//Срубание шашки

class Capture extends Move {
    #capturedPieceId;
    #capturedPiece;

    constructor(
        fromFieldId,
        toFieldId,
        type,
        movedPiece,
        capturedPieceId,
        capturedPiece
    ) {
        super(fromFieldId, toFieldId, type, movedPiece);
        this.#capturedPieceId = capturedPieceId;
        this.#capturedPiece = capturedPiece;
    }

    getCapturedPieceId() {
        return this.#capturedPieceId;
    }

    getCapturedPiece() {
        return this.#capturedPiece;
    }
}


// цвета полей
const LIGHT = "light";
const DARK = "dark";

// типы фигур
const FIELD = "field";
const CHECKER = "checker";
const KING = "king";

// пути
const WHITE_CHECKER_SRC = "images/whiteChecker.png"
const BLACK_CHECKER_SRC = "images/blackChecker.png"

const WHITE_KING_SRC = "images/whiteKing.png"
const BLACK_KING_SRC = "images/blackKing.png"

// цвета фигур
const WHITE = "white";
const BLACK = "black";

//создание полей
const LIGHT_FIELD = new Field(
    LIGHT,
    FIELD
);
const DARK_FIELD = new Field(
    DARK,
    FIELD,
);

//создание шашек
const WHITE_CHECKER = new Piece(
    DARK,
    CHECKER,
    WHITE_CHECKER_SRC,
    WHITE
);
const BLACK_CHECKER = new Piece(
    DARK,
    CHECKER,
    BLACK_CHECKER_SRC,
    BLACK
);

const WHITE_KING = new Piece(
    DARK,
    KING,
    WHITE_KING_SRC,
    WHITE
);
const BLACK_KING = new Piece(
    DARK,
    KING,
    BLACK_KING_SRC,
    BLACK
);

// Типы ходов
const MOVE = "move";
const CAPTURE = "capture";

// Кнопки
const COMMIT_TURN_BUTTON = "commit-turn";
const ROLLBACK_TURN_BUTTON = "rollback-turn";

//конструктор доски
const INITIAL_LAYOUT = "initial";
const EXAMPLE1_LAYOUT = "example1";

const board = new Board();

function Board() {
    const Column = function() {
        return {
            1: null,
            2: null,
            3: null,
            4: null,
            5: null,
            6: null,
            7: null,
            8: null
        };
    };

    // a <-> 1
    // ...
    // h <-> 8
    
    return {
        a: new Column(),
        b: new Column(),
        c: new Column(),
        d: new Column(),
        e: new Column(),
        f: new Column(),
        g: new Column(),
        h: new Column()
    };
}

let selectedPieceId;
//ход черных/белых

let turn;

let possibleMoves;
let possibleCaptures;

// Может быть от 0 до 1 движения за ход 
let moveHistory;

// Может быть от 0 до m захватов за ход
let captureHistory;


// Номер хода в игре
let currentTurnNumber;

let layout;

//Стандартное расположение
initialLayout();
layout = INITIAL_LAYOUT;

function initialLayout() {
	layout = INITIAL_LAYOUT;
// Цикл прохода по рядам
    for (let row = 8; row >= 1; --row) {
         // Определяет, является ли текущее поле темным
        let isDarkField = row % 2 === 1;
 // Какая фигура установлена в текущей клетке
        let field;
// Определяет, какая фигура должна быть установлена в зависимости от текущего ряда
        switch (row) {
            case 8:
            case 7:
            case 6:
                field = BLACK_CHECKER;
                break;
            
            case 5:
            case 4:
                field = DARK_FIELD;
                break;
            
            case 3:
            case 2:
            case 1:
                field = WHITE_CHECKER;
                break;
        }
// Теперь идем по клеткам текущего ряда (от a до h)
        for (const columnChar of "abcdefgh") {
            const id = columnChar + row;
 // Устанавливаем значение поля доски для текущей клетки в зависимости от того, темная ли клетка
            board[columnChar][row] = isDarkField ? field : LIGHT_FIELD;
 // Устанавливаем HTML-контент для текущей клетки на основе установленного значения поля
            setFieldHTML(id, board[columnChar][row]);

             // Сброс стилей
            removeStyle(id);
             //Чередование клеток
            isDarkField = !isDarkField;
        }
    }
 // Сбрасываем другие параметры состояния доски
    resetOtherBoardState();
}


//Пример
function example1Layout() {
	layout = EXAMPLE1_LAYOUT;

    for (let row = 8; row >= 1; --row) {
        let isDarkField = row % 2 === 1;

        for (const columnChar of "abcdefgh") {
            const id = columnChar + row;

            /*
            Белые: f4,h4
            Черные: b8, c1(дамка), c5, c7, e7, h6
            */

            let field;

            switch (id) {
                case "f4":
                case "h4":
                    field = WHITE_CHECKER;
                    break;
            
                case "b8":
                case "c5":
                case "c7":    
                case "e7":
                case "h6":    
                    field = BLACK_CHECKER;
                    break;
            
                case "c1":
                    field = BLACK_KING;
                    break;

                default:
                    field = isDarkField 
                            ? DARK_FIELD : LIGHT_FIELD;
                    break;
            }

            board[columnChar][row] = field;

            setFieldHTML(id, field);
            
            removeStyle(id);

            isDarkField = !isDarkField;
        }
    }

    resetOtherBoardState();
}

function setLayout() {
	switch (layout) {
	    case INITIAL_LAYOUT:
            initialLayout();
            break;
        case EXAMPLE1_LAYOUT:
        	example1Layout();
        	break;
        default:
        	initialLayout();
            break;
    }
	
}
// заполнение поля доски
function setFieldHTML(id, field) {
    const tdElement = document.getElementById(id);
        // Получаем элемент ячейки (td) по id
    const imgElement = tdElement.firstElementChild;

    imgElement.setAttribute("class", field.getClassName)
// Проверяем, является ли поле экземпляром класса Piece (фигуры)
    if (field instanceof Piece) {
        imgElement.setAttribute("src", field.getImgSrc());
    }

    else {
         // Если поле не является фигурой, удаляем атрибут "src" (если он существует)
        imgElement.removeAttribute("src")
    }
}

function removeStyle(id) {
    document.getElementById(id).removeAttribute("style");
}

//Сброс доски к изначальным параметрам
function resetOtherBoardState() {
    selectedPieceId = null;

    turn = WHITE;

    displayTurn();

    possibleCaptures = new Array();
    possibleMoves = new Array();
    
    captureHistory = new Array();
    moveHistory = null;

    currentTurnNumber = 1;

    document.getElementById("history").value = "";
}

function displayTurn() {
    const turnText = (turn === WHITE) ? "Ход белых" : "Ход чёрных";

    document.getElementById("turn").setAttribute("class", turn);
    document.getElementById("turn").textContent = turnText;
}
// Обработка клика по полю
function handleFieldClick(td) {
    // Получаем идентификатор (id) ячейки, на которую кликнули
    const id = td.id;

     // Получаем значение поля на доске по координатам (board[id[0]][id[1]])
    const field = board[id[0]][id[1]];

      // Проверяем, была ли выбрана какая-то фигура
    if (selectedPieceId === null) {
         // Определяем, можно ли выбрать данное поле
        const fieldCanBeSelected = () => {
            // Проверяем, является ли поле экземпляром класса Piece (фигуры)
            if (!(field instanceof Piece))
                return false;
  // Проверяем, является ли цвет фигуры текущим цветом игрока (ход которого сейчас)
            if (field.getPieceColor() !== turn)
                return false;
 // Проверяем, не было ли уже совершено движение
            if (moveHistory !== null)
                return false;
            // Проверяем, был ли предыдущий захват
            if (captureHistory.length > 0) {
                const lastCapture = captureHistory[captureHistory.length - 1];
 // Проверяем, было ли предыдущее захваченное поле равным текущему
                if (lastCapture.getToFieldId() !== id)
                    return false;
 // Проверяем, есть ли возможные захваты для текущей фигуры
                if (getPossibleCaptures(id, field).length === 0)
                    return false;
            }
            // Если все проверки пройдены, можно выбрать поле
            return true;
        };
        // Если поле можно выбрать, выбираем его

        if (fieldCanBeSelected()) {
            selectField(id, field);
        }
    }
    else {
                // Определяем, можно ли сделать ход или захват на данное поле
        const fieldIsPossibleMoveOrCapture = () => {
                // Проверяем, является ли это поле возможным ходом или захватом
            const isMove = possibleMoves.some(move => move.getToFieldId() === id);
            const isCapture = possibleCaptures.some(capture => capture.getToFieldId() === id);
      // Возвращаем true, если это возможный ход или захват
            return isMove || isCapture
        };
        // Проверяем, было ли кликнуто на уже выбранную фигуру
        if (id === selectedPieceId) {
                        // Если да, снимаем выделение с фигуры
            unselectField(id);
        }
        else if (fieldIsPossibleMoveOrCapture()) {
            // Если поле является возможным ходом или захватом, делаем соответствующее действие
            makeMoveOrCapture(id);
        }
    }
}

function setCSSColor(id, color) {
    const td = document.getElementById(id);

    td.style.backgroundColor = color;
}

//Отображение возможных ходов/захватов,Выбор фигуры


function selectField(id, piece) {
    selectedPieceId = id;

    setCSSColor(id, "yellow");

    // Надо смотреть могут ли другие шашки рубить,
    // если хоть одна может, то надо разрешить выбранной шашке
    // только рубить

    const canOnlyCapture = canOtherPiecesCaptureExcept(id);
    // Проверяем, могут ли другие шашки рубить
    possibleCaptures = getPossibleCaptures(id, piece);
     // Получаем возможности рубить для выбранной шашки
    const anyCaptures = possibleCaptures.length > 0;

    // Если другие шашки могут рубить и у текущей шашки нет захватов, 
    //то надо разрешить выбранной шашке только рубить
    if (canOnlyCapture && !anyCaptures)
        return;
// Если у текущей шашки нет захватов, получаем возможные ходы
    if (!anyCaptures)
        possibleMoves = getPossibleMoves(id, piece);

    const moveColor = anyCaptures ? "red" : "green";    

    const moves = anyCaptures ? possibleCaptures : possibleMoves;

    for (const move of moves)
        setCSSColor(move.getToFieldId(), moveColor);
}
// Снятие выбора с фигуры и снятие выделения с возможных ходов/захватов
function unselectField(id) {
    const anyCaptures = possibleCaptures.length > 0;

    const moves = anyCaptures ? possibleCaptures : possibleMoves;

    for (const move of moves)
        removeStyle(move.getToFieldId());

    if (anyCaptures)
        possibleCaptures = new Array();
    else
        possibleMoves = new Array();

    removeStyle(id);

    selectedPieceId = null;
}

// Получение возможных ходов в зависимости от типа фигуры
function canOtherPiecesCaptureExcept(exceptId) {
    for (let row = 8; row >= 1; --row) {
        for (const columnChar of "abcdefgh") {
            const id = columnChar + row;

            if (id === exceptId)
                continue;

            const field = board[columnChar][row];

            if (field instanceof Piece 
                    && field.getPieceColor() === turn
                    && getPossibleCaptures(id, field).length > 0) {
                return true;
            }
        }
    }

    return false;
}
// Возможные ходы для пешки
function getPossibleMoves(id, piece) {
    const column = id.charCodeAt(0) - "a".charCodeAt(0) + 1;
    const row = Number(id[1]);

    switch (piece.getType()) {
        case CHECKER:
            return getPossibleMovesForChecker(id, column, row);

        case KING:
            return getPossibleMovesForKing(id, column, row);
    }
}

// Возможные ходы для дамки
// Принимает текущие координаты дамки (столбец и строку) и её идентификатор на доске
// Добавляет возможные ходы в массив moves


function getPossibleMovesForChecker(id, column, row) {
    const moves = new Array();
 // Функция для проверки возможного хода и добавления его в массив
    const checkMoveAndPush = (toColumn, toRow) => {
        if (isValidMoveField(toColumn, toRow))
            pushMove(id, toColumn, toRow, moves);
    };

    // Обход по часовой стрелке от левого верхнего направления

    if (turn === WHITE) {
        checkMoveAndPush(column - 1, row + 1);
        checkMoveAndPush(column + 1, row + 1);
    }
    else {
        checkMoveAndPush(column + 1, row - 1);
        checkMoveAndPush(column - 1, row - 1);
    }

    return moves;
}
// Функция для определения возможных вариантов срубить для шашки
function getPossibleMovesForKing(id, column, row) {
    const moves = new Array();

    const checkMoveAndPush = (cOp, rOp) => {
        for (
                let toC = cOp(column),
                    toR = rOp(row);

                isValidMoveField(toC, toR);

                toC = cOp(toC),
                toR = rOp(toR)
        ) {
            pushMove(id, toC, toR, moves);
        }
    };

    // Обход по часовой стрелке от левого верхнего направления
    // Идём от дамки к краю

    checkMoveAndPush(c => c - 1, r => r + 1);
    checkMoveAndPush(c => c + 1, r => r + 1);
    checkMoveAndPush(c => c + 1, r => r - 1);
    checkMoveAndPush(c => c - 1, r => r - 1);

    return moves;
}

function getPossibleCaptures(id, piece) {
    const column = id.charCodeAt(0) - "a".charCodeAt(0) + 1;
    const row = Number(id[1]);

    switch (piece.getType()) {
        case CHECKER:
            return getPossibleCapturesForChecker(id, column, row);

        case KING:
            return getPossibleCapturesForKing(id, column, row);
    }
}
// Функция для определения возможных вариантов срубить для шашки

function getPossibleCapturesForChecker(id, column, row) {
    const captures = new Array();

    const checkCaptureAndPush = (cOp, rOp) => {
        const captureC = cOp(column);
        const captureR = rOp(row);

        const toC = cOp(captureC);
        const toR = rOp(captureR);

        if (isValidCaptureField(captureC, captureR) && isValidMoveField(toC, toR)) {
            pushCapture(
                id,
                toC,
                toR,
                captureC,
                captureR,
                captures
            );
        }
    }

    // Обход по часовой стрелке от левого верхнего направления

    checkCaptureAndPush(c => c - 1, r => r + 1);
    checkCaptureAndPush(c => c + 1, r => r + 1);
    checkCaptureAndPush(c => c + 1, r => r - 1);
    checkCaptureAndPush(c => c - 1, r => r - 1);

    return captures;
}

// Функция для определения возможных вариантов срубить для дамки

function getPossibleCapturesForKing(id, column, row) {
    const captures = new Array();

    const checkCaptureAndPush = (cOp, rOp) => {
        let captureC = cOp(column);
        let captureR = rOp(row);

        while (isValidMoveField(captureC, captureR)) {
            captureC = cOp(captureC);
            captureR = rOp(captureR);
        }

        if (isValidCaptureField(captureC, captureR)) {
            for (
                    let toC = cOp(captureC),
                        toR = rOp(captureR);

                    isValidMoveField(toC, toR);

                    toC = cOp(toC),
                    toR = rOp(toR)
            ) {
                pushCapture(
                    id,
                    toC,
                    toR,
                    captureC,
                    captureR,
                    captures
                );
            }
        }
    };

    // Обход по часовой стрелке от левого верхнего направления
    // Идём от дамки к краю

    checkCaptureAndPush(c => c - 1, r => r + 1);
    checkCaptureAndPush(c => c + 1, r => r + 1);
    checkCaptureAndPush(c => c + 1, r => r - 1);
    checkCaptureAndPush(c => c - 1, r => r - 1);

    return captures;
}
// Проверка, является ли поле допустимым для хода

function isValidMoveField(column, row) {
    const isField = (column, row) => {
        const columnChar = columnNumberToChar(column);

        return board[columnChar][row].getType() === FIELD;
    };

    return isValidIndex(column)
            && isValidIndex(row)
            && isField(column, row);
}

function columnNumberToChar(columnNumber) {
    return String.fromCharCode(
        "a".charCodeAt(0) + columnNumber - 1
    );
}

function isValidIndex(index) {
    return 1 <= index && index <= 8;
}
// Функция для проверки, является ли клетка допустимой для захвата

function isValidCaptureField(column, row) {
    const isEnemyPiece = (column, row) => {
        const columnChar = columnNumberToChar(column);

        const field = board[columnChar][row];

        return field instanceof Piece 
                && field.getPieceColor() !== turn;
    };

    return isValidIndex(column)
            && isValidIndex(row)
            && isEnemyPiece(column, row);
}
//Добавление хода в массив ходов
function pushMove(fromId, toColumn, toRow, moves) {
    const toColumnChar = columnNumberToChar(toColumn);

    moves.push(
        new Move(
            fromId,
            toColumnChar + toRow,
            MOVE,
            board[fromId[0]][fromId[1]],
        )
    );
}
// Добавление захвата в массив захватов
function pushCapture(
        fromId,
        toColumn,
        toRow,
        captureColumn,
        captureRow,
        captures
) {
    const toColumnChar = columnNumberToChar(toColumn);

    const captureColumnChar 
            = columnNumberToChar(captureColumn);

    captures.push(
        new Capture(
            fromId,
            toColumnChar + toRow,
            CAPTURE,
            board[fromId[0]][fromId[1]],
            captureColumnChar + captureRow,
            board[captureColumnChar][captureRow]
        )
    );
}

// Определяет, совершить ли ход или захват по указанному полю
function makeMoveOrCapture(toId) {
    if (possibleCaptures.length > 0)
        makeCapture(toId);
    else
        makeMove(toId);
}
// Обрабатывает захват шашки
function makeCapture(toId) {
    const capture = possibleCaptures.find(
        possibleCapture => possibleCapture.getToFieldId() === toId
    );

    captureHistory.push(capture);

    if (captureHistory.length === 1)
        disableButton(ROLLBACK_TURN_BUTTON, false);

    // Очищаем поле откуда рубит шашка

    setField(capture.getFromFieldId(), DARK_FIELD);

    // Очищаем поле со срубленной шашкой

    setField(capture.getCapturedPieceId(), DARK_FIELD);

    // Ставим рубящую шашку на выбранное поле

    const piece = getCheckerOrKing(capture);

    setField(capture.getToFieldId(), piece);

    // Убираем подсказки для поля, откуда шашка рубила

    if (selectedPieceId !== null)
        unselectField(capture.getFromFieldId());

    if (
            getPossibleCaptures(
                capture.getToFieldId(),
                piece
            ).length === 0
    ) {
        disableButton(COMMIT_TURN_BUTTON, false);
    }
	
	return piece;
}
// Обрабатывает обычный ход шашки
function makeMove(toId) {
    const move = possibleMoves.find(
        possibleMove => possibleMove.getToFieldId() === toId
    );

    moveHistory = move;

    disableButton(COMMIT_TURN_BUTTON, false);
    disableButton(ROLLBACK_TURN_BUTTON, false);

    // Очищаем поле откуда ходит шашка

    setField(move.getFromFieldId(), DARK_FIELD);

    // Ставим шашку на выбранное поле

    setField(move.getToFieldId(), getCheckerOrKing(move));

    // Убираем подсказки для поля, откуда шашка ходила

    if (selectedPieceId !== null)
        unselectField(move.getFromFieldId());
}
// Отключает или включает кнопку на основе параметра disable
function disableButton(buttonId, disable) {
    const button = document.getElementById(buttonId);

    if (disable)
        button.setAttribute("disabled", "");
    else
        button.removeAttribute("disabled");
}

// Обновляет состояние ячейки на доске и ее отображение на странице
function setField(id, field) {
    board[id[0]][id[1]] = field;

    setFieldHTML(id, field);
}
// Возвращает шашку или дамку в зависимости от типа переданного хода или захвата
function getCheckerOrKing(move) {
    if (move.getMovedPiece().getType() === KING)
        return move.getMovedPiece();

    if (turn === WHITE && move.getToFieldId()[1] === "8")
        return WHITE_KING;
    else if (turn === BLACK && move.getToFieldId()[1] === "1")
        return BLACK_KING;
    else
        return move.getMovedPiece();
}
// Завершает текущий ход и переключает ход к другому игроку

function commitTurn() {
    if (moveHistory !== null)
        commitMove();
    else
        commitCaptures();

    changeTurn();

    disableButton(COMMIT_TURN_BUTTON, true);
    disableButton(ROLLBACK_TURN_BUTTON, true);
}
// Завершает ход сделанным обычным ходом и добавляет информацию в историю

function commitMove() {
    const move = moveHistory;

    moveHistory = null;

    const history = document.getElementById("history");

    const fromId = move.getFromFieldId();
    const toId = move.getToFieldId();

    let turnText;

    if (turn === WHITE) {
        turnText = `${currentTurnNumber}. ${fromId}-${toId}`;
    }
    else {
        turnText = ` ${fromId}-${toId}\n`;

        ++currentTurnNumber;
    }

    history.value += turnText;
}
// Завершает ход сделанным захватом и добавляет информацию в историю

function commitCaptures() {
    const captures = captureHistory;

    captureHistory = new Array();

    const history = document.getElementById("history");

    let turnText;

    if (turn === WHITE) {
        turnText = `${currentTurnNumber}. `;
    }
    else {
        turnText = " ";

        ++currentTurnNumber;
    }

    const moveFields = [
        captures[0].getFromFieldId(),
        ...captures.map(capture => capture.getToFieldId())
    ];

    turnText += moveFields.join(":");
    
    if (turn === BLACK)
        turnText += "\n";

    history.value += turnText;
}
// Переключает ход к другому игроку

function changeTurn() {
    turn = (turn === WHITE) ? BLACK : WHITE;

    displayTurn();
}
// Отменяет текущий ход и возвращает доску в предыдущее состояние

function rollbackTurn() {
    if (selectedPieceId !== null) 
        unselectField(selectedPieceId);

    if (moveHistory !== null)
        rollbackMove();
    else
        rollbackCaptures();

    disableButton(COMMIT_TURN_BUTTON, true);
    disableButton(ROLLBACK_TURN_BUTTON, true);
}
// Отменяет обычный ход и возвращает доску в предыдущее состояние

function rollbackMove() {
    const move = moveHistory;

    moveHistory = null;

    // Убрать перемещённую шашку с поля

    setField(move.getToFieldId(), DARK_FIELD);

    // Поставить перемещённую шашку на изначальное поле

    setField(move.getFromFieldId(), move.getMovedPiece());
}
// Отменяет захваты и возвращает доску в предыдущее состояние

function rollbackCaptures() {
    const captures = captureHistory;

    captureHistory = new Array();

    // Убрать рубящую шашку с финального поля

    const lastCapture = captures[captures.length - 1];

    setField(lastCapture.getToFieldId(), DARK_FIELD);

    // Вернуть на место срубленные шашки

    for (const capture of captures) {
        setField(
            capture.getCapturedPieceId(),
            capture.getCapturedPiece()
        );
    }

    // Поставить рубящую шашку на начальное поле

    const firstCapture = captures[0];

    setField(
        firstCapture.getFromFieldId(), 
        firstCapture.getMovedPiece()
    );
}
// Обработчик кнопки "Установить расстановку"
function handleSetLayoutClick() {
    const history = document.getElementById("history");

    const lines = history.value.split(/\r?\n/);

    setLayout();

    let currentTurnNumber = 1;

    const whitespaceRegex = /^\s*$/;

    for (const line of lines) {
        // Если line состоит только из whitespace, то пропустим её

        if (line.match(whitespaceRegex) !== null)
            continue;

        const lineComponents = line.split(" ");

        // blackTurn может отсутствовать в конце истории
        // (быть пустой строкой или строкой только из whitespace)

        if (lineComponents.length < 2 || lineComponents.length > 3) {
            alertInvalidLine(line, "Неверная запись хода");

            setLayout();

            return;
        }

        const turnNumber = lineComponents[0];
        const whiteTurn = lineComponents[1];
        const blackTurn = (lineComponents.length === 3) 
                ? ((lineComponents[2].match(whitespaceRegex) !== null) 
                        ? null 
                        : lineComponents[2]) 
                : null;

        if (blackTurn === null && currentTurnNumber !== lines.length) {
            alertInvalidLine(line, "Отсутствует ход чёрных");

            setLayout();

            return;
        }
                
        if (
                !lineComponentsAreValid(
                    line,
                    turnNumber,
                    whiteTurn,
                    blackTurn,
                    currentTurnNumber
                )
        ) {
            setLayout();

            return;
        }

        if (!tryToMakeTurns(line, whiteTurn, blackTurn)) {
            setLayout();

            return;
        }

        ++currentTurnNumber;
    }
}

// Вспомогательная функция для вывода сообщения об ошибке и сброса доски
function alertInvalidLine(line, cause) {
    alert(`${cause}\nОшибка в строке:\n${line}`);

    alert(
        "Выберите какую-то из начальных расстановок или"
            + " введите корректную историю ходов"
    );
}

// Проверка корректности компонентов строки хода
function lineComponentsAreValid(
        line,
        turnNumber,
        whiteTurn,
        blackTurn,
        currentTurnNumber
) {
    if (!turnNumberIsValid(line, turnNumber, currentTurnNumber))
        return false;

    if (!turnsAreValid(line, whiteTurn, blackTurn))
        return false;

    return true;
}
// Проверка корректности номера хода
function turnNumberIsValid(line, turnNumber, currentTurnNumber) {
    if (turnNumber.match(/^\d+\.$/) === null) {
        alertInvalidLine(line, "Неверная запись номера хода");

        return false;
    }

    if (Number(turnNumber) !== currentTurnNumber) {
        alertInvalidLine(line, "Неверный номер хода");

        return false;
    }

    return true;
}
// Проверка корректности ходов в строке
function turnsAreValid(line, whiteTurn, blackTurn) {
    // Примеры: "f4-e5"

    const moveRegex = /^[a-h][1-8]-[a-h][1-8]$/;

    // Примеры: "g5:e7", "b2:f6:h4"

    const captureRegex = /^[a-h][1-8]:[a-h][1-8](?::[a-h][1-8])*$/;

    const eitherMoveOrCapture = turn => {
        const isMove = turn.match(moveRegex) !== null;
        const isCapture = turn.match(captureRegex) !== null;

        return isMove && !isCapture || !isMove && isCapture; 
    };

    if (!eitherMoveOrCapture(whiteTurn)) {
        alertInvalidLine(line, "Неверная запись хода белых");

        return false;
    }

    if (
            blackTurn !== null
            && !eitherMoveOrCapture(blackTurn)
    ) {
        alertInvalidLine(line, "Неверная запись хода чёрных");

        return false;
    }

    return true;
}
// Попытка выполнить ходы из строки
function tryToMakeTurns(line, whiteTurn, blackTurn) {
    if (!tryToMakeATurn(line, whiteTurn))
        return false;
    
    if (blackTurn !== null && !tryToMakeATurn(line, blackTurn))
        return false;

    return true;
}

// Попытка выполнить один ход
function tryToMakeATurn(line, currentTurn) {
    const fromId = currentTurn.substring(0, 2);

    const field = board[fromId[0]][fromId[1]];

    if (!isAllyPiece(line, currentTurn, field))
        return false;

    const canOnlyCapture = canOtherPiecesCaptureExcept(fromId);

    possibleCaptures = getPossibleCaptures(fromId, field);

    const anyCaptures = possibleCaptures.length > 0;

    if (canOnlyCapture && !anyCaptures) {
        alertInvalidLine(
            line,
            `В ходе ${currentTurn} нет доступных ходов и взятий`
        );

        return false;
    }

    if (!anyCaptures)
        possibleMoves = getPossibleMoves(fromId, field);
    
    const isMove = currentTurn.includes("-");

    if (isMove) {
        if (!tryToMakeAMove(line, currentTurn))
            return false;
    }
    else {
        // Нормально передавать field, мы его двигаем при каждом
        // взятии и изменять его не нужно

        if (!tryToMakeACapture(line, currentTurn, fromId, field))
            return false;
    }

    return true;
}

// Проверка, является ли фигура соответствующего цвета
function isAllyPiece(line, currentTurn, field) {
    if (!(field instanceof Piece)) {
        alertInvalidLine(
            line,
            `В ходе ${currentTurn} на начальной позиции нет фигуры`
        );

        return false;
    }

    if (field.getPieceColor() !== turn) {
        alertInvalidLine(
            line,
            `В ходе ${currentTurn} на начальной позиции стоит`
                + " фигура чужого цвета"
        );

        return false;
    }

    return true;
}
// Попытка выполнить обычный ход
function tryToMakeAMove(line, currentTurn) {
    //  01234
    // "a1-b2"

    const toId = currentTurn.substring(3, 5);

    if (possibleCaptures.length > 0) {
        alertInvalidLine(
            line,
            `В ходе ${currentTurn} фигура может только рубить`
        );

        return false;
    }

    if (
            !possibleMoves.some(
                possibleMove => possibleMove.getToFieldId() 
                    === toId
            )
    ) {
        alertInvalidLine(
            line,
            `В ходе ${currentTurn} фигура не может переместиться`
                + " на выбранную клетку"
        );

        return false;
    }

    makeMove(toId);

    possibleMoves = new Array();

    commitTurn();

    return true;
}

// Попытка выполнить ход с взятиями
function tryToMakeACapture(line, currentTurn, fromId, piece) {
    const toIds = currentTurn.split(":").slice(1);

    for (const toId of toIds) {
        if (
            !possibleCaptures.some(
                possibleCapture => possibleCapture.getToFieldId()
                    === toId
            )
        ) {
            alertInvalidLine(
                line,
                `В ходе ${currentTurn} фигура не может рубить и`
                    + " перемещаться на выбранную клетку"
            );
    
            return false;
        }

        piece = makeCapture(toId);

        possibleCaptures = new Array();

        // Перерасчёт

        fromId = toId;

        possibleCaptures = getPossibleCaptures(fromId, piece);
    }

    // Если были выполнены все взятия из предоставленной записи хода,
    // но данная фигура всё ещё может рубить - это ошибка

    // в possibleCaptures хранятся возможные взятия
    // с последней итерации

    if (possibleCaptures.length > 0) {
        alertInvalidLine(
            line,
            `В ходе ${currentTurn} фигура может рубить после`
                + " выполнения всех указанных взятий"
        );

        return false;
    }

    // Сброс доступных взятий после последнего взятия

    possibleCaptures = new Array();

        // Подтверждение хода

    commitTurn();

    return true;
}
