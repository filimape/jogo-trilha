import combinations_json from "../../../../../../data/combinations.json";
import { LayerCombinationsType } from "../interfaces/dotCombinationType";
import { DotType } from "../interfaces/dotType";
import { Player } from "../interfaces/player";

export class GamePoints {

    private _combinations: LayerCombinationsType;

    constructor() {
        this._combinations = combinations_json as LayerCombinationsType;
    }

    private getDotMatchingLayers(dot: DotType): number[][] {
        const matchingArrays: number[][] = [];

        dot.layers.forEach((layer) => {
            const layerIndex = layer as 1 | 2 | 3 | 4;

            const dotsCombination = this._combinations.layers[layerIndex]

            if (layer) {
                matchingArrays.push(...dotsCombination.filter(arr => arr.includes(parseInt(dot.id))));
            }

        });

        return matchingArrays;
    }

    private getAllMatchingLayers(): number[][] {
        const matchingArrays: number[][] = [];

        const dotsCombinationLayerOne = this._combinations.layers[1]
        const dotsCombinationLayerTwo = this._combinations.layers[2]
        const dotsCombinationLayerThree = this._combinations.layers[3]
        const dotsCombinationLayerFour = this._combinations.layers[4]

        matchingArrays.push(...dotsCombinationLayerOne);
        matchingArrays.push(...dotsCombinationLayerTwo);
        matchingArrays.push(...dotsCombinationLayerThree);
        matchingArrays.push(...dotsCombinationLayerFour);


        return matchingArrays;
    }

    hasPlayerEnemyDotsToEat(eatTime: boolean, boardDots: DotType[], playerTurn: string, firstPlayer: Player, secondPlayer: Player): boolean {
        const playerEnemy = playerTurn == firstPlayer?.id ? secondPlayer?.id : firstPlayer?.id;

        let hasEnemyDotsToEat = false;

        boardDots.forEach(dot => {
            if (dot.has_piece === true && dot.blink_dot === true && dot.player === playerEnemy)
                hasEnemyDotsToEat = true;
        });

        return hasEnemyDotsToEat;
    }

    dotToEatIsInARowCombination(dot_clicked: DotType, currentDots: DotType[], getDot: (dot_id: string, currentDots: DotType[]) => DotType): boolean {
        const combinationsMatched = this.getDotMatchingLayers(dot_clicked);
        let dotIsInARow = false;

        combinationsMatched.forEach(combinations => {
            const dots: DotType[] = [];

            combinations.filter(id => String(id) != dot_clicked.id).forEach(dot_id => {
                const dot = getDot(String(dot_id), currentDots);

                dots.push(dot);
            });

            if (
                dots.every(
                    dot =>
                        (dot.hasOwnProperty('has_piece') || dot?.has_piece) && dot_clicked.player == dot.player)
            )
                dotIsInARow = true;

        });

        return dotIsInARow;
    }

    allEnemyDotsIsInARowCombination(playerTurn: string, currentDots: DotType[], firstPlayer: Player, secondPlayer: Player, getDot: (dot_id: string, currentDots: DotType[]) => DotType): boolean {
        const gamePoints = new GamePoints();
        const playerEnemy = playerTurn == firstPlayer?.id ? secondPlayer?.id : firstPlayer?.id;

        currentDots.forEach(dot_prev => {
            const dotIsInRow = gamePoints.dotToEatIsInARowCombination(dot_prev, currentDots, getDot);

            if (dotIsInRow === false && dot_prev.has_piece === true && dot_prev.player == playerEnemy) {
                return false;
            }
        });

        return true;
    }

    rowCombined(dot_clicked: DotType, playerTurn: string, currentDots: DotType[], getDot: (dot_id: string, currentDots: DotType[]) => DotType): boolean {
        const combinationsMatched = this.getDotMatchingLayers(dot_clicked);
        let rowMaked = false;

        combinationsMatched.forEach(combinations => {
            const dots: DotType[] = [];

            combinations.filter(id => String(id) != dot_clicked.id).forEach(dot_id => {
                const dot = getDot(String(dot_id), currentDots);

                dots.push(dot);
            });

            if (
                dots.every(
                    dot =>
                        (dot.hasOwnProperty('has_piece') || dot?.has_piece) && dot.player === playerTurn) && dot_clicked.player == undefined
            )
                rowMaked = true;

        });

        return rowMaked;
    }

    gameOver(playerTurn: string, currentDots: DotType[], firstPlayer: Player, secondPlayer: Player): boolean {
        const playerEnemy = playerTurn == firstPlayer?.id ? secondPlayer?.id : firstPlayer?.id;

        const enemyDots = currentDots
            .filter(x => x.player === playerEnemy)
            .length;

        return enemyDots < 3;
    }
}