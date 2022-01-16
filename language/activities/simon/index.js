import { Text } from 'react-native'

const applyBoldStyle = (text, clr) => {
    var color = '#3B8EFF';
    if (clr == 'red') color = '#FF5755';
    else if (clr == 'green') color = '#459449';
    let numberOfItemsAdded = 0;
    const result = text.sentence.split(/\{\d+\}/);
    text.boldText.forEach((boldText, i) => result.splice(++numberOfItemsAdded + i, 0, <Text key={i} style={{fontWeight: 'bold', color: color}}>{boldText}</Text>));
    return <Text>{result}</Text>;
};

export const lang = {
    fr: {
        Play: "Jouer",
        Help: "Aide",
        Leave: "Retour",
        BestScore: (bestScore) => {
            return (applyBoldStyle({
                sentence: "Meilleur score: {0}",
                boldText: [bestScore]
            }))
        },
        DailyScore: (dailyScore) => {
            return (applyBoldStyle({
                sentence: "Meilleur score du jour: {0}",
                boldText: [dailyScore]
            }))
        },
        YourTurn: () => {
            return (applyBoldStyle({
                sentence: "{0}",
                boldText: ['A votre tour !']
            }))
        },
        WaitNSee: () => {
            return (applyBoldStyle({
                sentence: "{0}",
                boldText: ['Regardez attentivement...']
            }))
        },
        Failed: () => {
            return (applyBoldStyle({
                sentence: "{0}",
                boldText: ['Raté ! ...']
            }, 'red'))
        },
        NiceHit: () => {
            return (applyBoldStyle({
                sentence: "{0}",
                boldText: ["Bien joué !!"]
            }, 'green'))
        },
        Tries: (tries) => {
            return (applyBoldStyle({
                sentence: "Essai(s) restant(s): {0}",
                boldText: [tries]
            }, 'red'))
        },
        BestScoreToday: (score) => {
            return (applyBoldStyle({
                sentence: "Vous venez de battre votre record du jour : {0} !",
                boldText: [score]
            }))
        },
        Congratulations: 'Félicitations !!',
        SoBad: "Dommage...",
        ScoreNotBeated: "Votre score du jour n'a pas été battu... Mais vous pouvez toujours recommencer !",
        Retry: 'Recommencer',
        Exit: "S'arrêter",
        Start: "Commencer une partie",
    },
    en: {
        Play: "Play",
        Help: "Help",
        Leave: "Go back",
        BestScore: (bestScore) => {
            return (applyBoldStyle({
                sentence: "Best score: {0}",
                boldText: [bestScore]
            }))
        },
        DailyScore: (dailyScore) => {
            return (applyBoldStyle({
                sentence: "Best score today: {0}",
                boldText: [dailyScore]
            }))
        },
        YourTurn: () => {
            return (applyBoldStyle({
                sentence: "{0}",
                boldText: ['Your turn!']
            }))
        },
        WaitNSee: () => {
            return (applyBoldStyle({
                sentence: "{0}",
                boldText: ['Look carefully...']
            }))
        },
        Failed: () => {
            return (applyBoldStyle({
                sentence: "{0}",
                boldText: ['Failed! ...']
            }, 'red'))
        },
        Tries: (tries) => {
            return (applyBoldStyle({
                sentence: "Remaining tries: {0}",
                boldText: [tries]
            }, 'red'))
        },
        NiceHit: () => {
            return (applyBoldStyle({
                sentence: "{0}",
                boldText: ["Well done!!"]
            }, 'green'))
        },
        BestScoreToday: (score) => {
            return (applyBoldStyle({
                sentence: "You did your day best score : {0}!",
                boldText: [score]
            }))
        },
        Congratulations: 'Congratulations!!',
        SoBad: "So sad...",
        ScoreNotBeated: "Your daily score has not been beaten... But you can retry!",
        Retry: 'Retry',
        Exit: 'Exit',
        Start: "Start a game",
    }
};