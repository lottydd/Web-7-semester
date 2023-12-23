"use strict";


//Поле
class Field {
    #className; //цвет
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

const board = new Board();


//конструктор доски
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

// Может быть от 0 до n захватов за ход
let captureHistory;

// Номер хода в игре
let currentTurnNumber;


//Стандартное расположение
initialLayout();

function initialLayout() {
    // Цикл прохода по рядам
    for (let row = 8; row >= 1; --row) {
        // Определяет, является ли текущее поле темным
        let isDarkField = row % 2 === 1;

        // Какая фигура установлена в текущей клетке
        let field;

        // Определяет, какая фигура должна быть установлена в зависимости от текущего ряда
        switch (row) {
            // 8 7 6 ряд черные шашки
            case 8:
            case 7:
            case 6:
                field = BLACK_CHECKER;
                break;
            
            // 5 4 ряд свободные клетки
            case 5:
            case 4:
                field = DARK_FIELD;
                break;
            
            // ряд  3 2 1 белые шашки
            case 3:
            case 2:
            case 1:
                field = WHITE_CHECKER;
                break;
        }

        // Теперь идем по клеткам текущего ряда (от a до h)
        for (const columnChar of "abcdefgh") {
            // id клетки(a8 b7 c6 и  тд)
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
    for (let row = 8; row >= 1; --row) {
        let isDarkField = row % 2 === 1;

        for (const columnChar of "abcdefgh") {
            const id = columnChar + row;

          //  Белые: f4,h4
          //  Черные: b8, c1(дамка), c5, c7, e7, h6
            

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
                    field = isDarkField ? DARK_FIELD : LIGHT_FIELD;
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

// заполнение поля доски
function setFieldHTML(id, field) {
    // Получаем элемент ячейки (td) по id
    const tdElement = document.getElementById(id);

    const imgElement = tdElement.firstElementChild;

    imgElement.setAttribute("class", field.getClassName);

    // Проверяем, является ли поле экземпляром класса Piece (фигуры)
    if (field instanceof Piece) {
        // Если поле - фигура, устанавливаем атрибут "src" для изображения, используя путь к изображению фигуры
        imgElement.setAttribute("src", field.getImgSrc());
    } else {
        // Если поле не является фигурой, удаляем атрибут "src" (если он существует)
        imgElement.removeAttribute("src");
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
    } else {
        // Определяем, можно ли сделать ход или захват на данное поле
        const fieldIsPossibleMoveOrCapture = () => {
            // Проверяем, является ли это поле возможным ходом или захватом
            const isMove = possibleMoves.some(move => move.getToFieldId() === id);
            const isCapture = possibleCaptures.some(capture => capture.getToFieldId() === id);

            // Возвращаем true, если это возможный ход или захват
            return isMove || isCapture;
        };

        // Проверяем, было ли кликнуто на уже выбранную фигуру
        if (id === selectedPieceId) {
            // Если да, снимаем выделение с фигуры
            unselectField(id);
        } else if (fieldIsPossibleMoveOrCapture()) {
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
    const moves = anyCaptures ? possibleCaptures : possibleMoves;  // Получаем список ходов (захватов или обычных) и устанавливаем цвет

    for (const move of moves)
        setCSSColor(move.getToFieldId(), moveColor);  // Устанавливаем цвет для каждого возможного хода/захвата
}

// Снятие выбора с фигуры и снятие выделения с возможных ходов/захватов
function unselectField(id) {
    const anyCaptures = possibleCaptures.length > 0;  // Проверяем, есть ли захваты
    const moves = anyCaptures ? possibleCaptures : possibleMoves;  // Получаем список ходов (захватов или обычных) и снимаем цвет

    for (const move of moves)
        removeStyle(move.getToFieldId());  // Удаляем цвет для каждого возможного хода/захвата

    // Если были захваты, очищаем массив захватов, иначе - массив ходов
    if (anyCaptures)
        possibleCaptures = new Array();
    else
        possibleMoves = new Array();

    removeStyle(id);  // Снимаем цвет 
    selectedPieceId = null;  // Сбрасываем идентификатор выбранной шашки
}

function canOtherPiecesCaptureExcept(exceptId) {
    // Перебираем все клетки на доске
    for (let row = 8; row >= 1; --row) {
        for (const columnChar of "abcdefgh") {
            const id = columnChar + row;

            // Пропускаем выбранную клетку
            if (id === exceptId)
                continue;

            const field = board[columnChar][row];  // Получаем значение поля

            // Проверяем, является ли поле фигурой текущего игрока и может ли захватить другие фигуры
            if (field instanceof Piece && field.getPieceColor() === turn && getPossibleCaptures(id, field).length > 0) {
                return true;  // Если найдена фигура, способная захватывать, возвращаем true
            }
        }
    }
    return false;  // Если не найдено других фигур, способных захватывать, возвращаем false
}

// Получение возможных ходов в зависимости от типа фигуры
function getPossibleMoves(id, piece) {
    const column = id.charCodeAt(0) - "a".charCodeAt(0) + 1;  // Получаем координаты клетки
    const row = Number(id[1]);

    switch (piece.getType()) {
        case CHECKER:
            return getPossibleMovesForChecker(id, column, row);  // Получаем возможные ходы для шашки

        case KING:
            return getPossibleMovesForKing(id, column, row);  // Получаем возможные ходы для дамки
   }
}
// Возможные ходы для пешки
function getPossibleMovesForChecker(id, column, row) {
    const moves = new Array();

    // Проверка возможного хода и добавления его в массив
    const checkMoveAndPush = (toColumn, toRow) => {
        if (isValidMoveField(toColumn, toRow))
            pushMove(id, toColumn, toRow, moves);  // Если ход допустим, добавляем его в массив
    };

    // Обход по часовой стрелке от левого верхнего направления

    // Если ходит белая пешка
    if (turn === WHITE) {
        checkMoveAndPush(column - 1, row + 1);  // Проверка и добавление хода налево и вперед
        checkMoveAndPush(column + 1, row + 1);  // Проверка и добавление хода направо и вперед
    } else {
        // Если ходит черная пешка
        checkMoveAndPush(column + 1, row - 1);  // Проверка и добавление хода направо и назад
        checkMoveAndPush(column - 1, row - 1);  // Проверка и добавление хода налево и назад
    }

    return moves; 
}

// Возможные ходы для дамки
// Принимает текущие координаты дамки (столбец и строку) и её идентификатор на доске
// Добавляет возможные ходы в массив moves

function getPossibleMovesForKing(id, column, row) {
    const moves = new Array();  // Создаем массив для хранения возможных ходов

    // Функция для проверки возможного хода и добавления его в массив
    const checkMoveAndPush = (cOp, rOp) => {
        for (
                let toC = cOp(column),
                    toR = rOp(row);

                isValidMoveField(toC, toR);

                toC = cOp(toC),
                toR = rOp(toR)
        ) {
            pushMove(id, toC, toR, moves);  // Если ход допустим, добавляем его в массив
        }
    };

    // Обход по часовой стрелке от левого верхнего направления
    // Идем от дамки к краю

    // Проверка и добавление хода вверх и налево
    checkMoveAndPush(c => c - 1, r => r + 1);
    // Проверка и добавление хода вверх и направо
    checkMoveAndPush(c => c + 1, r => r + 1);
    // Проверка и добавление хода вниз и направо
    checkMoveAndPush(c => c + 1, r => r - 1);
    // Проверка и добавление хода вниз и налево
    checkMoveAndPush(c => c - 1, r => r - 1);

    return moves;  
}

// Функция для определения возможных вариантов срубить для шашки
function getPossibleCaptures(id, piece) {
    // Получаем номер столбца и строки
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
        // Получаем координаты захватываемой и конечной клеток
        const captureC = cOp(column);
        const captureR = rOp(row);
        const toC = cOp(captureC);
        const toR = rOp(captureR);

        // Проверяем, является ли захват допустимым, и является ли следующий ход допустимым
        if (isValidCaptureField(captureC, captureR) && isValidMoveField(toC, toR)) {
            // Добавляем захват в массив
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

    // Обход по часовой стрелке от левого верхнего угла

    checkCaptureAndPush(c => c - 1, r => r + 1); // Захват в направлении вверх и влево
    checkCaptureAndPush(c => c + 1, r => r + 1); // Захват в направлении вверх и вправо
    checkCaptureAndPush(c => c + 1, r => r - 1); // Захват в направлении вниз и вправо
    checkCaptureAndPush(c => c - 1, r => r - 1); // Захват в направлении вниз и влево

    // Возвращаем массив возможных захватов
    return captures;
}

// Функция для определения возможных вариантов срубить для дамки
function getPossibleCapturesForKing(id, column, row) {
    const captures = new Array();

    // Функция для проверки захвата и добавления его в массив
    const checkCaptureAndPush = (cOp, rOp) => {
        // Координаты захватываемой клетки
        let captureC = cOp(column);
        let captureR = rOp(row);

        // Проходим по диагонали от текущей клетки до края доски
        while (isValidMoveField(captureC, captureR)) {
            // Обновляем координаты захватываемой клетки
            captureC = cOp(captureC);
            captureR = rOp(captureR);
        }

        // Проверяем, является ли захват допустимым
        if (isValidCaptureField(captureC, captureR)) {
            // Проходим по диагонали от текущей клетки до края доски и добавляем захваты в массив
            for (
                let toC = cOp(captureC),
                    toR = rOp(captureR);

                isValidMoveField(toC, toR);

                toC = cOp(toC),
                toR = rOp(toR)
            ) {
                // Добавляем захват в массив
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

    // Обход по часовой стрелке от левого верхнего угла
    // Идем от дамки к краю доски

    checkCaptureAndPush(c => c - 1, r => r + 1); // Захват в направлении вверх и влево
    checkCaptureAndPush(c => c + 1, r => r + 1); // Захват в направлении вверх и вправо
    checkCaptureAndPush(c => c + 1, r => r - 1); // Захват в направлении вниз и вправо
    checkCaptureAndPush(c => c - 1, r => r - 1); // Захват в направлении вниз и влево

    // Возвращаем массив возможных захватов
    return captures;
}
// Проверка, является ли поле допустимым для хода
function isValidMoveField(column, row) {
    // Проверяем, является ли клетка полем без шашки
    const isField = (column, row) => {
        const columnChar = columnNumberToChar(column);

        return board[columnChar][row].getType() === FIELD;
    };

    // Проверяем, что индексы столбца и строки допустимы, и клетка является полем
    return isValidIndex(column) && isValidIndex(row) && isField(column, row);
}

function columnNumberToChar(columnNumber) {
    return String.fromCharCode("a".charCodeAt(0) + columnNumber - 1);
}

function isValidIndex(index) {
    return 1 <= index && index <= 8;
}

// Функция для проверки, является ли клетка допустимой для захвата
function isValidCaptureField(column, row) {
    // является ли клетка вражеской шашкой
    const isEnemyPiece = (column, row) => {
        const columnChar = columnNumberToChar(column);

        const field = board[columnChar][row];

        // Проверяем, является ли клетка вражеской шашкой
        return field instanceof Piece && field.getPieceColor() !== turn;
    };

    // Проверяем, что индексы столбца и строки допустимы, и клетка является вражеской шашкой
    return isValidIndex(column) && isValidIndex(row) && isEnemyPiece(column, row);
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

    const captureColumnChar = columnNumberToChar(captureColumn);

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


//lab  3

// Определяет, совершить ли ход или захват по указанному полю
function makeMoveOrCapture(toId) {
    if (possibleCaptures.length > 0)
        makeCapture(toId);
    else
        makeMove(toId);
}

// Обрабатывает захват шашки
function makeCapture(toId) {
    // Находим информацию о захвате для указанного поля
    const capture = possibleCaptures.find(
        possibleCapture => possibleCapture.getToFieldId() === toId
    );

    // Добавляем информацию о захвате в историю
    captureHistory.push(capture);

    // Если это первый захват в ходе, разблокируем кнопку отмены хода
    if (captureHistory.length === 1)
        disableButton(ROLLBACK_TURN_BUTTON, false);

    // Очищаем поле, откуда была сделана атака
    setField(capture.getFromFieldId(), DARK_FIELD);

    // Очищаем поле, где стояла срубленная шашка
    setField(capture.getCapturedPieceId(), DARK_FIELD);

    // Помещаем атакующую шашку на выбранное поле
    const piece = getCheckerOrKing(capture);
    setField(capture.getToFieldId(), piece);

    // Убираем подсветку с поля, откуда шашка сделала атаку
    if (selectedPieceId !== null)
        unselectField(capture.getFromFieldId());

    // Если после атаки больше нельзя делать захваты, разблокируем кнопку завершения хода
    if (getPossibleCaptures(capture.getToFieldId(), piece).length === 0)
        disableButton(COMMIT_TURN_BUTTON, false);
}

// Обрабатывает обычный ход шашки
function makeMove(toId) {
    // Находим информацию о ходе для указанного поля
    const move = possibleMoves.find(
        possibleMove => possibleMove.getToFieldId() === toId
    );

    // Записываем информацию о ходе в историю
    moveHistory = move;

    // Разблокируем кнопку завершения хода и отмены хода
    disableButton(COMMIT_TURN_BUTTON, false);
    disableButton(ROLLBACK_TURN_BUTTON, false);

    // Очищаем поле, откуда был сделан ход
    setField(move.getFromFieldId(), DARK_FIELD);

    // Помещаем шашку на выбранное поле
    setField(move.getToFieldId(), getCheckerOrKing(move));

    // Убираем подсветку с поля, откуда шашка сделала ход
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

    // Заблокировать кнопки завершения и отмены хода
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
    } else {
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
    } else {
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

    // Заблокировать кнопки завершения и отмены хода
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
}// Определяет, совершить ли ход или захват по указанному полю
function makeMoveOrCapture(toId) {
    if (possibleCaptures.length > 0)
        makeCapture(toId);
    else
        makeMove(toId);
}

// Обрабатывает захват шашки
function makeCapture(toId) {
    // Находим информацию о захвате для указанного поля
    const capture = possibleCaptures.find(
        possibleCapture => possibleCapture.getToFieldId() === toId
    );

    // Добавляем информацию о захвате в историю
    captureHistory.push(capture);

    // Если это первый захват в ходе, разблокируем кнопку отмены хода
    if (captureHistory.length === 1)
        disableButton(ROLLBACK_TURN_BUTTON, false);

    // Очищаем поле, откуда была сделана атака
    setField(capture.getFromFieldId(), DARK_FIELD);

    // Очищаем поле, где стояла срубленная шашка
    setField(capture.getCapturedPieceId(), DARK_FIELD);

    // Помещаем атакующую шашку на выбранное поле
    const piece = getCheckerOrKing(capture);
    setField(capture.getToFieldId(), piece);

    // Убираем подсветку с поля, откуда шашка сделала атаку
    if (selectedPieceId !== null)
        unselectField(capture.getFromFieldId());

    // Если после атаки больше нельзя делать захваты, разблокируем кнопку завершения хода
    if (getPossibleCaptures(capture.getToFieldId(), piece).length === 0)
        disableButton(COMMIT_TURN_BUTTON, false);
}

// Обрабатывает обычный ход шашки
function makeMove(toId) {
    // Находим информацию о ходе для указанного поля
    const move = possibleMoves.find(
        possibleMove => possibleMove.getToFieldId() === toId
    );

    // Записываем информацию о ходе в историю
    moveHistory = move;

    // Разблокируем кнопку завершения хода и отмены хода
    disableButton(COMMIT_TURN_BUTTON, false);
    disableButton(ROLLBACK_TURN_BUTTON, false);

    // Очищаем поле, откуда был сделан ход
    setField(move.getFromFieldId(), DARK_FIELD);

    // Помещаем шашку на выбранное поле
    setField(move.getToFieldId(), getCheckerOrKing(move));

    // Убираем подсветку с поля, откуда шашка сделала ход
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

    // Заблокировать кнопки завершения и отмены хода
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
    } else {
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
    } else {
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

    // Заблокировать кнопки завершения и отмены хода
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