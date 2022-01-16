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
        View: "Voir les quizz",
        Create: "Créer un quizz",
        Help: "Comment ça marche",
        Leave: "Retour",
    },
    en: {
        Play: "Play",
        View: "View quizz",
        Create: "Create a quizz",
        Help: "How does it works",
        Leave: "Leave",
    }
};