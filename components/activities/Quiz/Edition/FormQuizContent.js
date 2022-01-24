import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    SafeAreaView,
    Image
} from 'react-native';
import { Button, Icon, Input, Badge, FAB } from 'react-native-elements';
import * as DocumentPicker from 'expo-document-picker';

import { lang as QuizLang } from '../../../../language/activities/quiz';
import SuccessContent from './SuccessContent';

import * as API from '../../../../data/quizApi';

import styles from '../styles';

export default function FormQuizContent(props) {
    const [answer, setAnswer] = useState();

    const addAnswer = () => {
        if (!answer?.trim()) {
            return null;
        } else if (props.answers?.includes(answer?.trim()?.toLowerCase()) === false) {
            props.setAnswers([...props.answers, answer?.trim()?.toLowerCase()]);
        }
        setAnswer();
    };

    const pickOutAnswer = (i) => {
        const tmp = props.answers;
        tmp.splice(i, 1)
        props.setAnswers([...tmp]);
    };

    const clearFile = () => {
        props.setFileType();
        props.setFilename();
        props.setUri();
    };

    const printFile = () => {
        if (props.fileType == 'image') {
            return (
                <View>
                    <FAB
                        color='red'
                        style={{marginLeft: 20, position:'absolute', zIndex: 9}}
                        size="small"
                        icon={{name: 'close-circle-outline', type: 'ionicon', color:'white' }}
                        onPress={() => {
                            clearFile();
                        }}
                    />
                    <Image source={{uri: props.uri}} style={{width: 200, height: 200, borderRadius: 100, marginBottom: 30}} />
                </View>
            )
        }
    };

    const pickFile = async () => {
        if (Platform.OS === 'web') {
            alert('todo');
            return;
        }

        let result = await DocumentPicker.getDocumentAsync({type: ['image/*', 'audio/*']});
        if (result.type === 'cancel') {
            return;
        }

        props.setUri(result.uri);
        props.setFileType(result.mimeType.split('/')[0]);
        props.setFilename(result.name);
    };

    const close = () => {
        props.setSuccess(false);
    }

    if (props.success) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.ScrollViewSuccess}>
                    <SuccessContent edit={false} lang={props.lang} close={close} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.ScrollView}>
                { printFile() }
                <Button
                    title={QuizLang[props.lang].ImportFile}
                    buttonStyle={{ borderRadius: 15 }}
                    onPress={pickFile}
                />
                <Text style={styles.overlayDescriptionReference}>
                    {QuizLang[props.lang].ReferenceFile}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center', marginHorizontal: 45, flexShrink: 1, flexWrap:'wrap'}}>
                    <Input
                        value={props.question}
                        inputStyle={{fontSize: 14}}
                        containerStyle={{marginBottom: 50}}
                        placeholder={QuizLang[props.lang].WhatIsTheQuestion}
                        onChangeText={(e) => props.setQuestion(e)}
                    />
                    <View style={{flexDirection: 'row', alignItems: 'center', flexShrink: 1, flexWrap:'nowrap', width: 90 + '%'}}>
                    <Input
                        placeholder={QuizLang[props.lang].AddAnswer}
                        inputStyle={{fontSize: 14}}
                        value={answer}
                        onChangeText={(e) => setAnswer(e)}
                    />
                    <Button
                        icon={
                            <Icon
                                name={'add-circle'}
                                type={'ionicon'}
                                color={'white'}
                                size={18}
                                style={{ marginHorizontal: 5 }}
                            />
                        }
                        onPress={() => addAnswer()}
                    />
                    </View>
                </View>
                <Text style={styles.overlayDescriptionReference}>
                    {QuizLang[props.lang].WhatIsAnswer}
                </Text>
                <View style={styles.badgesView}>
                    {props.answers.map( (el, i) => {
                        return(
                            <Badge
                                key={i}
                                value={el}
                                badgeStyle={{paddingHorizontal: 15, height: 30, marginHorizontal: 10, marginVertical: 4}}
                                onPress={() => pickOutAnswer(i)}
                            />
                        )
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};