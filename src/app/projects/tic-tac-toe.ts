import { boardFactory } from "./boardFactory";
import { computerPlayerFactory } from "./computerPlayerFactory";
//import { ComputerPlayerService } from "./ComputerPlayerService";
import { inject, autoinject, bindable } from "aurelia-framework";
import { DialogService } from "aurelia-dialog";
import { GameSettings, PlayOption } from "./game-settings";
import { Router } from "aurelia-router";
import { KeyValue } from "../resources/KeyValue";
import {PLATFORM} from 'aurelia-pal';
//import $ from 'bootstrap';
import * as $ from "jquery";

@autoinject()
export class TicTacToe {
    private board: any;
    private computerPlayer: any;


    defaultGameSettings = new GameSettings(null);
    public nRows: number = this.defaultGameSettings.nRows;
    public nColumns: number = this.defaultGameSettings.nColumns;
    @bindable
    public showState: boolean = this.defaultGameSettings.showState;
    @bindable
    public showDepth: boolean = this.defaultGameSettings.showDepth;
    //public gameSettings: any;
    public selectedPlayOption: KeyValue<PlayOption, string> = this.defaultGameSettings.selectedPlayOption;
    humanFirst: boolean = this.defaultGameSettings.humanFirst;
    currentPlayer: string;
    pieces: number[][];

    // Would it be better to inject a board object instead of the factory?
    constructor(
            public dialogService: DialogService,
            public router: Router/*,
            public computerPlayerService: ComputerPlayerService*/) {
        this.dialogService = dialogService;
        this.router = router;
        this.setNonGameSettingsProps();
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async canActivate() {
    }

    async attached() {
        //let result = await this.loadGameSettings();
        this.updateSquareDisplay();
        if (this.selectedPlayOption.key === PlayOption.HumanVsComputer && !this.humanFirst) {
            await this.makeComputerPlayerMove();
        }
        // cpu vs cpu
        if (this.selectedPlayOption.key === PlayOption.ComputerVsComputer) {
            // disable all squares
            $("." + this.squareClass).prop({ disabled: true });
            while (this.board.getState() === this.board.state.unfinished) {
                await this.sleep(1000);
                await this.makeComputerPlayerMove();
            }
        }
    }
    getGameSettings() {
    }

    public setNonGameSettingsProps() {
        this.board = boardFactory({ numRows: this.nRows, numColumns: this.nColumns });
        this.currentPlayer = this.board.getCurrentPlayer();
        this.computerPlayer = computerPlayerFactory();
        this.pieces = this.board.getPieces();
    }
    public async loadGameSettings() {
        // Get settings from the user
        let promise = new Promise<boolean>((resolve, reject) => {
            //this.dialogService.open({ viewModel: GameSettings })
            this.dialogService.open({ viewModel: PLATFORM.moduleName('app/projects/game-settings') })
                .whenClosed(response => {
                    if (!response.wasCancelled) {
                        this.nRows = response.output.nRows;
                        this.nColumns = response.output.nColumns;
                        this.showState = response.output.showState;
                        this.showDepth = response.output.showDepth;
                        this.selectedPlayOption = response.output.selectedPlayOption;
                        this.humanFirst = response.output.humanFirst;
                        this.setNonGameSettingsProps();
                        resolve(true);
                    } else {
                        reject(false);
                    }
                });
        });
        return promise;
    }
    private readonly winClass: string = "win";
    private readonly loseClass: string = "lose";
    private readonly tieClass: string = "tie";
    private readonly playedClass: string = "played";
    private readonly xPlayedClass: string = "x-played";
    private readonly oPlayedClass: string = "o-played";

    async playPiece(row: number, column: number) {
        // Disable square of the move just played
        let square = document.getElementById(this.getSquareId(row, column)) as HTMLButtonElement;
        square.disabled = true;


        // Place piece
        square.innerHTML = this.board.getCurrentPlayer();
        $(square).fadeOut(1);
        $(square).fadeIn(10);
        //$(square).animate({ backgroundColor: "white" }, 10000);
        this.board.playPiece({ row: row, column: column });
        this.currentPlayer = this.board.getCurrentPlayer();

        // Give square just played new class for being played
        square.classList.add(this.playedClass);
        square.classList.add(this.currentPlayer === this.board.piece.x ? this.xPlayedClass : this.oPlayedClass);

        // Remove state color indication classes and depth numbers and update the non-empty squares
        $(square).removeClass(this.stateClasses);
        let displ = this.updateSquareDisplay();

        let state = this.board.getState();
        if (state !== this.board.state.unfinished) {
            // Someone one the game! 
            $("." + this.squareClass).prop({ disabled: true });
            await this.sleep(100);
            if (state === this.board.state.xWon) {
                alert("x won");
            } else if (state === this.board.state.oWon) {
                //setTimeout(() => { alert("o won"); }, 1);
                alert("o won");
            } else if (state === this.board.state.draw) {
                //setTimeout(() => { alert("tie"); }, 1);
                alert("tie");
            }
        }


        return displ;
    }
    onReset() {
        //this.router.navigateToRoute("tic-tac-toe");
        //this.router.navigateToRoute("projects/tic-tac-toe");
        // Reactivate page and update the squares with selected options
        this.loadGameSettings().then((response) => {
            //this.updateSquareDisplay();
            if (response) {
                // Enable all the squares
                let squares = $("." + this.squareClass);
                squares.prop({ disabled: false });
                squares.removeClass(this.stateClasses);
                squares.removeClass(this.playedClasses);
                this.attached();
            }
        }).catch(function () {
            // without catching rejection (They clicked "Close"), an error will get thrown
            // So, just swallow it....
        });
    }
    private get playedClasses() {
        return `${this.playedClass} ${this.xPlayedClass} ${this.oPlayedClass}`;
    }
    private get stateClasses() {
        return this.winClass + " " + this.loseClass + " " + this.tieClass;
    }
    private currentPlayerWins(state) {
        let currentPlayer = this.board.getCurrentPlayer();
        return (currentPlayer === this.board.piece.x && state === this.board.state.xWon) ||
            (currentPlayer === this.board.piece.o && state === this.board.state.oWon);
    }
    private readonly squareClass = "square";
    private updateSquareDisplay() {
        // Remove classes that indicate the state of the square so you can update it
        $("." + this.squareClass).removeClass(this.stateClasses);

        // Get the depth and state information of all empty squares
        //return this.computerPlayerService.getMoveValues(this.board)
            //.then((result: any[]) => {
                //let moveValues = result;

//////////////
//let promise = new Promise((resolve, reject) => {
            let moveValues = this.computerPlayer.getMoveValues(this.board);
//////



                // Update the display of each non-empty square
                for (let iMove = 0; iMove < moveValues.length; ++iMove) {
                    let square = this.getSquare(moveValues[iMove].row, moveValues[iMove].column);

                    if (this.showDepth) {
                        // Show depth checked. Show depth information
                        square.innerHTML = moveValues[iMove].depth;
                    } else {
                        square.innerHTML = "";
                    }

                    if (this.showState) {
                        // Show state checked. Show state information
                        if (moveValues[iMove].state === this.board.state.draw) {
                            $(square).addClass(this.tieClass);
                        } else if (this.currentPlayerWins(moveValues[iMove].state)) {
                            $(square).addClass(this.winClass);
                        } else {
                            $(square).addClass(this.loseClass);
                        }
                    }
                }
            //});



    }
    private getUnplayedSquares() {
        let unplayedSquares = $(".square:not(.played)");
        return unplayedSquares;
    }
    async makeComputerPlayerMove() {
        // disable btns so cpu player can make move
        $("." + this.squareClass).prop({ disabled: true });

        await this.sleep(1000);// think...

        // Make move
        let bestMove = this.computerPlayer.getBestMove(this.board);
        this.playPiece(bestMove.row, bestMove.column);

        // Re-enable buttons if playing human
        let state = this.board.getState();
        if (this.selectedPlayOption.key === PlayOption.HumanVsComputer && state === this.board.state.unfinished) {
            this.getUnplayedSquares().prop({ disabled: false });
        }
    }
    public async onSquareClick(row: number, column: number) {
        this.playPiece(row, column);
        let state = this.board.getState();
        if (this.selectedPlayOption.key === PlayOption.HumanVsComputer && state === this.board.state.unfinished) {
            // It is computer player's turn. Make his or her move.
            await this.makeComputerPlayerMove();
        }
    }

    private getSquareId(row: number, column: number) {
        return "sq" + "-" + row + "-" + column;
    }
    private getSquare(row: number, column: number): HTMLElement {
        let squareId = this.getSquareId(row, column);
        return document.getElementById(squareId) as HTMLElement;
    }
    showStateChanged(oldValue: boolean, newValue: boolean) {
        this.updateSquareDisplay();
    }
    showDepthChanged(oldValue: boolean, newValue: boolean) {
        this.updateSquareDisplay();
    }
}