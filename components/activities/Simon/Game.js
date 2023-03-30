import React, { useEffect, useState } from 'react';
import { View, Modal, Platform } from 'react-native';
import { Text, Button, Overlay } from 'react-native-elements';
import { lang as SimonLang } from '../../../language/activities/simon';
import { Audio } from 'expo-av';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import ConfettiCannon from 'react-native-confetti-cannon';

import Lottie from '../../utils/Lottie';
import TrophyImage from '../../../assets/img/activities/trophy.gif';

import * as API from '../../../data/simonApi';

import styles from './styles';
import { ActivityIndicator } from 'react-native-web';

export default function Game(props) {
    const [start, setStart] = useState(false);
    const [failed, setFailed] = useState(false);
    const [canPlay, setCanPlay] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tries, setTries] = useState(4); // 3 tries at the beginning of the game
    const [order, setOrder] = useState([Math.round(Math.random() * 3)]); // generate a random first order
    const [success, setSuccess] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(-1);
    const [bestScore, setBestScore] = useState(0);
    const [dailyScore, setDailyScore] = useState(0);
    const [niceHit, setNiceHit] = useState(false);
    const [confetti, setConfetti] = useState(false);
    const [game, setGame] = useState(new Array(0));

    const [scoreBeaten, setScoreBeaten] = useState(false);

    const LottieSource = require('../../../assets/lottie/trophy.json');
    const currentDate = new Date().toLocaleDateString('fr-FR');

    const SimonButtonStyle = Platform.OS == 'web' ? styles.SimonButtonWeb : styles.SimonButton;

    useEffect(() => {
        // API.clear(props.personId);
        if (start === false) {
            setLoading(true);
            API.getBestScore(props.personId).then((data) => {
                if (data.length > 0) {
                    setBestScore(data[0].score);
                }
            });
            API.getScoreDay(props.personId, currentDate).then((data) => {
                if (data.length > 0) {
                    setDailyScore(data[0].score);
                }
            });
            setLoading(false);
        } else {
            setNiceHit(false);
            setCanPlay(false);
            // If the game started, show a demo of the actions.
            // The useEffect is launched when the game is launched
            // or when the order is updated (at the end of a turn)
            for (let i = 0; i < order.length; i++) {
                if (!success)
                    playButtonDemo(order[i]);
            }
            setCanPlay(true);
        }
    }, [start, order]);

    const randomNumber = () => {
        return Math.round(Math.random() * 3);
    };

    const pickCorrectSound = (idx) => {
        switch (idx) {
            case 0:
                return require('../../../assets/sound/simon/green.mp3');
            case 1:
                return require('../../../assets/sound/simon/red.mp3');
            case 2:
                return require('../../../assets/sound/simon/yellow.mp3');
            case 3:
                return require('../../../assets/sound/simon/green.mp3');
            default:
                return require('../../../assets/sound/simon/red.mp3');
                break;
        }
    };

    const playButtonDemo = async (idx) => {
        // Play a sound according to the idx and simulates a button pressure according to it
        return new Promise(async (resolve, reject) => {
            if (sound) await sound?.unloadAsync();
            const { sound } = await Audio.Sound.createAsync(
                pickCorrectSound(idx)
            ).then(async s => {
                return s;
            }).catch(e => {
                console.log(e);
            });
            props.setSound(sound);
            setButtonClicked(idx);
            await sound.playAsync().then(async (playBackStatus) => {
                setTimeout(async () => {
                    setButtonClicked(-1);
                    await sound.unloadAsync();
                    resolve(true);
                }, playBackStatus.playableDurationMillis - 320);
            }).catch(err => {
                console.log(err);
            });
        });
    };

    const yourTurn = () => {
        if (failed) {
            return SimonLang[props.lang].Failed();
        } else if (niceHit) {
            return SimonLang[props.lang].NiceHit();
        } else {
            return SimonLang[props.lang].YourTurn();
        }
    };

    const playButton = async (idx) => {
        if (!canPlay) {
            return;
        }
        if (game.length >= order.length) {
            return;
        }
        if (idx >= 0 && idx <= 3) {
            let playedGame = game;
            playedGame.push(idx);
            setGame(playedGame);

            if (sound) {
                await sound.unloadAsync();
            }
            setButtonClicked(idx);
            const { sound } = await Audio.Sound.createAsync(
                pickCorrectSound(idx)
            );
            props.setSound(sound);

            var time = await sound.playAsync().then((data) => {
                return data.playableDurationMillis;
            });

            // @todo manage each hit instead of just the last one

            setTimeout(async () => {
                await sound.unloadAsync();
                setButtonClicked(-1);
            }, time - 320);
            if (game[game.length - 1] !== order[game.length - 1]) {
                await failRound(time);
            } else if (game.length === order.length) {
                await successRound(time, sound);
            }
        }
    };

    const failRound = async (time) => {
        setFailed(true);
        setGame([]);
        setCanPlay(false);
        setTries(tries - 1);
        if (tries > 1) {
            setTimeout(async () => {
                for (let i = 0; i < order.length; i++) {
                    await playButtonDemo(order[i]);
                }
                setCanPlay(true);
                setFailed(false);
            }, time - 320);
        } else {
            completeGame();
        }
    };

    const completeGame = async () => {
        props.setModal(false);
        await API.insertScore(props.personId, order.length - 1, currentDate, dailyScore < order.length - 1, bestScore < order.length - 1);
        setCanPlay(false);
        setSuccess(true);
        const path = dailyScore < order.length - 1 ? require(`../../../assets/sound/global/applause.mp3`) : require(`../../../assets/sound/global/you_lose.mp3`);
        const { sound } = await Audio.Sound.createAsync(path);
        props.setSound(sound);
        sound.playAsync();
        if (dailyScore < order.length - 1) {
            setScoreBeaten(true);
        } else {
            setScoreBeaten(false);
        }
    };

    const successRound = async (time, sound) => {
        setNiceHit(true);
        setCanPlay(false);
        setTimeout(async () => {
            await sound.unloadAsync();
            let rdm = randomNumber();
            setOrder([...order, rdm]);
        }, time - 320);
        setGame([]);
    };

    const successOverlay = () => {
        if (!confetti) {
            setConfetti(true);
        }
        return (
            <>
                <Text style={styles.headerOverlay}>
                    {SimonLang[props.lang].Congratulations}
                </Text>
                <Text style={styles.textOverlay}>
                    {SimonLang[props.lang].BestScoreToday(order.length - 1)}
                </Text>
                <Lottie
                    LottieSource={LottieSource}
                    ImageSource={TrophyImage}
                    autoplay={true}
                    loop={false}
                    LottieStyle={{ height: hp('7%') }}
                    ImageStyle={{ height: hp('10%') }}
                />
            </>
        );
    };

    const failOverlay = () => {
        if (loading) {
            return <ActivityIndicator />;
        }
        return (
            <>
                <Text style={styles.headerOverlay}>
                    {SimonLang[props.lang].SoBad}
                </Text>
                <Text style={styles.textOverlay}>
                    {SimonLang[props.lang].ScoreNotBeated}
                </Text>
            </>
        );
    };

    const retryGame = () => {
        setConfetti(false);
        setSuccess(false);
        setFailed(false);
        setTries(4);
        setOrder([randomNumber()]);
    };

    return (
        <>
            {confetti ? (
                <ConfettiCannon
                    fadeOut={true}
                    autoStart={true}
                    fallSpeed={6000}
                    count={50}
                    origin={{ x: -20, y: -35 }}
                />
            ) : (
                <></>
            )}

            {/* Overlay modal end of the game */}
            <Overlay
                visible={success}
                overlayStyle={styles.overlayStyle}
                onBackdropPress={() => setSuccess(false)}
                ModalComponent={Modal}
            >
                {scoreBeaten ? successOverlay() : failOverlay()}
                <View style={{ flexDirection: 'row', marginVertical: 30 }}>
                    <Button
                        raised
                        onPress={() => {
                            retryGame();
                        }}
                        title={SimonLang[props.lang].Retry}
                        containerStyle={{
                            borderRadius: 13,
                            marginRight: 10,
                        }}
                        titleStyle={styles.btnTitle}
                    />
                    <Button
                        raised
                        onPress={() => {
                            props.setTab(0);
                        }}
                        title={SimonLang[props.lang].Exit}
                        containerStyle={{ borderRadius: 13 }}
                        buttonStyle={{ backgroundColor: 'red' }}
                        titleStyle={styles.btnTitle}
                    />
                </View>
            </Overlay>

            {/* Are you sure to exit - Overlay */}
            <Overlay
                visible={props.modal}
                overlayStyle={styles.overlayStyle}
                onBackdropPress={() => props.setModal(false)}
                ModalComponent={Modal}
            >
                <Text style={styles.headerOverlay}>
                    {SimonLang[props.lang].AreYouSure}
                </Text>
                <Text style={styles.textOverlay}>
                    {SimonLang[props.lang].ToGiveUp}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: 15 }}>
                    <Button
                        raised
                        onPress={() => {
                            props.setModal(false);
                        }}
                        title={SimonLang[props.lang].Cancel}
                        titleStyle={styles.btnTitle}
                        containerStyle={{ borderRadius: 13, marginRight: 10 }}
                    />
                    <Button
                        raised
                        onPress={() => {
                            completeGame();
                        }}
                        title={SimonLang[props.lang].TimeToStop}
                        containerStyle={{ borderRadius: 13 }}
                        titleStyle={styles.btnTitle}
                        buttonStyle={{ backgroundColor: 'red' }}
                    />
                </View>
            </Overlay>

            {/* The first row of the Simon */}
            <View style={{ flexDirection: 'row', marginBottom: hp('2%') }}>
                <View
                    style={[
                        SimonButtonStyle,
                        styles.SimonLeftButton,
                        styles.SimonGreen,
                        buttonClicked === 0 ? styles.clickedButton : '',
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => playButton(0)}
                />
                <View
                    style={[
                        SimonButtonStyle,
                        styles.SimonRed,
                        buttonClicked === 1 ? styles.clickedButton : '',
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => playButton(1)}
                />
            </View>

            {/* The second row of the Simon */}
            <View style={{ flexDirection: 'row' }}>
                <View
                    style={[
                        SimonButtonStyle,
                        styles.SimonLeftButton,
                        styles.SimonYellow,
                        buttonClicked === 2 ? styles.clickedButton : '',
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => playButton(2)}
                />
                <View
                    style={[
                        SimonButtonStyle,
                        styles.SimonBlue,
                        buttonClicked === 3 ? styles.clickedButton : '',
                    ]}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => playButton(3)}
                />
            </View>

            <View style={styles.bottomScore}>
                <Text style={styles.bestScore}>
                    {SimonLang[props.lang].BestScore(bestScore)}
                </Text>
                <Text style={styles.bestScore}>
                    {SimonLang[props.lang].DailyScore(dailyScore)}
                </Text>
                <Text style={styles.remainingTries}>
                    {SimonLang[props.lang].Tries(tries)}
                </Text>
                {start ? (
                    <View
                        style={{ alignContent: 'center', alignItems: 'center' }}
                    >
                        <Text style={styles.indication}>
                            {canPlay || failed
                                ? yourTurn()
                                : SimonLang[props.lang].WaitNSee()}
                        </Text>
                        <Text style={styles.bestScore}>
                            {SimonLang[props.lang].Progress(
                                order.length,
                                game.length
                            )}
                        </Text>
                        <Button
                            disabled={!canPlay}
                            disabledStyle={styles.btnGiveUpDisabled}
                            onPress={() => props.setModal(true)}
                            titleStyle={styles.btnTitle}
                            buttonStyle={styles.btnGiveUp}
                            containerStyle={styles.btnContainerGiveUp}
                            raised
                            title={SimonLang[props.lang].GiveUp}
                        />
                    </View>
                ) : (
                    <>
                        <View
                            flexDirection={'row'}
                            style={{
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Button
                                buttonStyle={styles.btnStart}
                                title={SimonLang[props.lang].Start}
                                titleStyle={styles.btnTitle}
                                onPress={() => setStart(true)}
                            />
                            <Button
                                buttonStyle={styles.btnLeave}
                                titleStyle={styles.btnTitle}
                                title={SimonLang[props.lang].Leave}
                                onPress={() => props.setTab(0)}
                            />
                        </View>
                    </>
                )}
            </View>
        </>
    );
}
