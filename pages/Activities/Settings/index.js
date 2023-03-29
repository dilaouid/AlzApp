import React, { useState } from 'react';

import { ScrollView, Alert, View, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-elements';
import Success from '../../../components/selection/PersonCreation/Success';

import { useNavigate } from 'react-router-native';

import { lang as ActivitiesLang } from '../../../language/activities';
import { lang as InterfaceLang } from '../../../language/interface';
import * as Person from '../../../data/personApi';
import { exportPerson } from '../../../utils/share';
import * as Sharing from 'expo-sharing';

import * as FileSystem from 'expo-file-system';

import styles from './styles';
import Form from '../../../components/selection/PersonCreation/Form';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';


export default function Settings(props) {
    const [edit, setEdit] = useState(false);
    const [success, setSuccess] = useState(false);
    const [image, setImage] = useState();
    const [fullname, setFullname] = useState(props.person.fullname);
    const [uriPreview, setUriPreview] = useState(props.person.picture);
    const [description, setDescription] = useState(props.person.description);
    const [load, setLoad] = useState(false);
    const [id, setId] = useState(0);

    const navigate = useNavigate();

    const good = () => {
        Person.getById(props.personId).then((result) => {
            props.setPerson(result[0])
        });
        setSuccess(true);
    };

    const clear = () => {
        setSuccess(false);
    };

    const compProps = {
        lang: props.lang,

        fullname: fullname,
        setFullname: setFullname,

        image: image,
        setImage: setImage,

        uriPreview: uriPreview,
        setUriPreview: setUriPreview,

        description: description,
        setDescription: setDescription,

        id: id,
        setId: setId
    };

    const deletePerson = () => {
        Person.deleteById(props.personId).then((deleted) => {
            navigate('/selection', {
                state: { username: props.username, lang: props.lang }
            });
        });
    };

    const openModalDeleteProfile = () => {
        return Alert.alert(
            InterfaceLang[props.lang].AreYouSure,
            InterfaceLang[props.lang].DeletePerson(props.fullname),
            [
                {
                    text: InterfaceLang[props.lang].Yes,
                    onPress: () => {
                        deletePerson();
                    },
                },
                {
                    text: InterfaceLang[props.lang].No,
                },
            ]
        );
    };
    return (
        <View style={{ flex: 1 }}>
            {edit === false ? (
                <ScrollView style={{ flex: 1 }}>
                    <Button
                        icon={{
                            name: 'user',
                            type: 'font-awesome',
                            size: wp('6%'),
                            color: 'white',
                        }}
                        iconContainerStyle={{ marginRight: wp('15%'), marginLeft: wp('5%') }}
                        buttonStyle={styles.buttonStyle}
                        titleStyle={{fontSize: wp('4%')}}
                        containerStyle={styles.containerStyle}
                        onPress={() => {
                            setEdit(true);
                        }}
                        title={ActivitiesLang[props.lang]?.ChangeProfile}
                    />
                    <Button
                        icon={{
                            name: load ? '' : 'share-alt',
                            type: 'font-awesome',
                            size: wp('6%'),
                            color: 'white',
                        }}
                        iconContainerStyle={{ marginRight: wp('15%'), marginLeft: wp('5%') }}
                        buttonStyle={styles.buttonStyle}
                        titleStyle={{fontSize: wp('4%')}}
                        containerStyle={styles.containerStyle}
                        title={load ? <ActivityIndicator color={'white'} size={'small'} /> : ActivitiesLang[props.lang]?.ShareProfile}
                        onPress={async () => {
                            setLoad(true);
                            Sharing.isAvailableAsync().then(async isAvailable => {
                                if (!isAvailable) {
                                    alert('Sharing is not available');
                                    return;
                                }
                                console.log('[~] Pressing export button');
                                console.log('[+] Exporting person...');
                                const uri = await exportPerson(props.personId, null);
                                console.log('[+] Exported person! uri is: ' + uri);
                                Sharing.shareAsync(uri).then( async (e) => {
                                    await FileSystem.deleteAsync(uri);
                                }).catch(err => {
                                    console.log(err);
                                });
                                setLoad(false);
                            });
                        }}
                        disabled={load}
                    />
                    <Button
                        icon={{
                            name: 'remove',
                            type: 'font-awesome',
                            size: wp('6%'),
                            color: 'white',
                        }}
                        iconPosition={'left'}
                        iconContainerStyle={{ marginRight: wp('15%'), marginLeft: wp('5%') }}
                        buttonStyle={styles.buttonStyleDelete}
                        containerStyle={styles.containerStyle}
                        title={ActivitiesLang[props.lang]?.DeleteProfile}
                        titleStyle={{fontSize: wp('4%')}}
                        onPress={() => {
                            openModalDeleteProfile();
                        }}
                    />
                    <Button
                        icon={{
                            name: 'caret-left',
                            type: 'font-awesome',
                            size: wp('6%'),
                            color: 'white',
                        }}
                        iconPosition={'left'}
                        iconContainerStyle={{ marginRight: wp('18%'), marginLeft: wp('5%') }}
                        buttonStyle={styles.buttonStyleBack}
                        titleStyle={{fontSize: wp('4%')}}
                        containerStyle={styles.containerStyle}
                        title={ActivitiesLang[props.lang]?.Back}
                        onPress={() => {
                            navigate('/selection', {
                                state: { username: props.username, lang: props.lang }
                            });
                        }}
                    />
                </ScrollView>
            ) : (
                <KeyboardAvoidingView behavior='height' style={{ flex: 1, backgroundColor: 'white' }}>
                    <Button
                        icon={{
                            name: 'arrow-circle-o-up',
                            type: 'font-awesome',
                            size: wp('6%'),
                            color: 'white',
                        }}
                        iconContainerStyle={{ marginRight: wp('23%'), marginLeft: wp('5%') }}
                        buttonStyle={styles.buttonStyleReturn}
                        containerStyle={styles.containerStyle}
                        titleStyle={{fontSize: wp('4%')}}
                        title={ActivitiesLang[props.lang]?.ReturnList}
                        onPress={() => { 
                            setFullname(props.person.fullname);
                            setUriPreview(props.person.picture);
                            setImage('');
                            setDescription(props.person.description);
                            setEdit(false);
                            setSuccess(false);
                        }}
                    />
                    {success ? (
                        <Success {...compProps} close={clear} edit={true} />
                    ) : (
                        <Form
                            {...compProps}
                            edit={true}
                            persons={props.person}
                            setFullnameHeader={props.setFullname}
                            personId={props.personId}
                            scs={good}
                        />
                    )}
                </KeyboardAvoidingView>
            )}
        </View>
    );
}
