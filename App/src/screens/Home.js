import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    useColorScheme,
    SafeAreaView,
} from 'react-native';

import {
    TwilioVideoLocalView,
    TwilioVideoParticipantView,
    TwilioVideo,
} from 'react-native-twilio-video-webrtc';

import {
    checkMultiple,
    request,
    requestMultiple,
    PERMISSIONS,
    RESULTS,
} from 'react-native-permissions';

const initialState = {
    isAudioEnabled: true,
    status: 'disconnected',
    participants: new Map(),
    videoTracks: new Map(),
    userName: '',
    roomName: '',
    token: '',
};


const Home = ({ navigation }) => {

    const [props, setProps] = useState(initialState);


    console.log('Homeeeeeeee=>>>>>>>>>>>>>>>', props);


    const _checkPermissions = (callback) => {
        const iosPermissions = [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE];
        const androidPermissions = [
            PERMISSIONS.ANDROID.CAMERA,
            PERMISSIONS.ANDROID.RECORD_AUDIO,
        ];
        checkMultiple(
            Platform.OS === 'ios' ? iosPermissions : androidPermissions,
        ).then((statuses) => {
            const [CAMERA, AUDIO] =
                Platform.OS === 'ios' ? iosPermissions : androidPermissions;
            if (
                statuses[CAMERA] === RESULTS.UNAVAILABLE ||
                statuses[AUDIO] === RESULTS.UNAVAILABLE
            ) {
                Alert.alert(
                    'Error',
                    'Hardware to support video calls is not available',
                );
            } else if (
                statuses[CAMERA] === RESULTS.BLOCKED ||
                statuses[AUDIO] === RESULTS.BLOCKED
            ) {
                Alert.alert(
                    'Error',
                    'Permission to access hardware was blocked, please grant manually',
                );
            } else {
                if (
                    statuses[CAMERA] === RESULTS.DENIED &&
                    statuses[AUDIO] === RESULTS.DENIED
                ) {
                    requestMultiple(
                        Platform.OS === 'ios' ? iosPermissions : androidPermissions,
                    ).then((newStatuses) => {
                        if (
                            newStatuses[CAMERA] === RESULTS.GRANTED &&
                            newStatuses[AUDIO] === RESULTS.GRANTED
                        ) {
                            callback && callback();
                        } else {
                            Alert.alert('Error', 'One of the permissions was not granted');
                        }
                    });
                } else if (
                    statuses[CAMERA] === RESULTS.DENIED ||
                    statuses[AUDIO] === RESULTS.DENIED
                ) {
                    request(statuses[CAMERA] === RESULTS.DENIED ? CAMERA : AUDIO).then(
                        (result) => {
                            if (result === RESULTS.GRANTED) {
                                callback && callback();
                            } else {
                                Alert.alert('Error', 'Permission not granted');
                            }
                        },
                    );
                } else if (
                    statuses[CAMERA] === RESULTS.GRANTED ||
                    statuses[AUDIO] === RESULTS.GRANTED
                ) {
                    callback && callback();
                }
            }
        });
    };

    useEffect(() => {
        _checkPermissions();
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.form}>
                    <View style={styles.formGroup}>
                        <Text style={styles.text}>User Name</Text>
                        <TextInput
                            style={styles.textInput}
                            autoCapitalize="none"
                            value={props.userName}
                            onChangeText={(text) => setProps({ ...props, userName: text })}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.text}>Room Name</Text>
                        <TextInput
                            style={styles.textInput}
                            autoCapitalize="none"
                            value={props.roomName}
                            onChangeText={(text) => setProps({ ...props, roomName: text })}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <TouchableOpacity
                            disabled={false}
                            style={styles.button}
                            onPress={() => {
                                _checkPermissions(() => {
                                    fetch(`https://b8a3-203-129-207-42.ngrok.io/twilio/create-video-room-token`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            room: props.roomName,
                                            identity: props.userName
                                        }),
                                    })
                                        .then(response => {
                                            console.log('gggg', response);
                                            if (response.ok) {
                                                return response.json();
                                            } else {
                                                return response.text().then(error => {
                                                    throw new Error(error);
                                                });
                                            }
                                        })
                                        .then(data => {
                                            setProps({ ...props, token: data });
                                            navigation.navigate('Video Call');
                                        })
                                        .catch(error => {
                                            console.error('Error:', error);
                                            Alert.alert('API request failed');
                                        });
                                });
                            }}

                        >
                            <Text style={styles.buttonText}>Connect to Video Call</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default Home


const styles = StyleSheet.create({

    text: {
        color: 'black'
    },

    buttonText: {
        color: 'white',
        padding: 10,
        backgroundColor: 'blue',
        textAlign: "center",
    },

    textInput: {
        color: 'black',
        borderColor: 'black'
    }
})