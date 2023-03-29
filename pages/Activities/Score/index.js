import React from 'react';
import { ScrollView } from 'react-native';
import QuizScore from './QuizScore';
import SimonScore from './SimonScore';
import DoubleScore from './DoubleScore';

export default function Score(props) {
    return (
        <ScrollView style={{ flex: 1 }}>
            <QuizScore lang={props.lang} personId={props.personId} />
            <DoubleScore lang={props.lang} personId={props.personId} />
            <SimonScore lang={props.lang} personId={props.personId} />
        </ScrollView>
    );
}
