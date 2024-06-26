﻿import { DialogController } from "aurelia-dialog";
import { autoinject, inject } from "aurelia-framework";
import { KeyValue } from "../resources/KeyValue";

export enum PlayOption {
    HumanVsHuman = 0,
    HumanVsComputer,
    ComputerVsComputer
}


@autoinject()
export class GameSettings {
    public readonly minRows: number = 0;
    public readonly minColumns: number = 0;
    public readonly maxRows: number = 3;
    public readonly maxColumns: number = 3;

    public nRows: number = this.maxRows;
    public nColumns: number = this.maxColumns;
    public showState: boolean = true;
    public showDepth: boolean = true;
    public showBoardStats: boolean = true;
    humanFirst: boolean = undefined;
    public playOptions: KeyValue<PlayOption, string>[] = [
        { key: PlayOption.HumanVsHuman, value: "Human versus Human" },
        { key: PlayOption.HumanVsComputer, value: "Human versus Computer" },
        { key: PlayOption.ComputerVsComputer, value: "Computer versus Computer" }
    ];
    public selectedPlayOption: KeyValue<PlayOption, string> = this.playOptions[0];

    constructor(public controller: DialogController) {
        this.controller = controller;
    }
    public activate(model) {
        this.nRows = model.nRows;
        this.nColumns = model.nColumns;
        this.showState = model.showState;
        this.showDepth = model.showDepth;
        this.showBoardStats = model.showBoardStats;
        this.selectedPlayOption = model.selectedPlayOption;
        this.humanFirst = model.humanFirst;
    }
    public getSettings() {
        return {
            nRows: this.nRows,
            nColumns: this.nColumns,
            showState: this.showState,
            showDepth: this.showDepth,
            showBoardStats: this.showBoardStats,
            selectedPlayOption: this.selectedPlayOption,
            humanFirst: this.humanFirst
        };
    }
}