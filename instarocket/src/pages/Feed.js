import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity, FlatList, StyleSheet} from "react-native";

import io from 'socket.io-client';
import api from '../services/api';


import camera from '../assets/camera.png'
import more from '../assets/more.png'
import like from '../assets/like.png'
import comment from '../assets/comment.png'
import send from '../assets/send.png'

class Feed extends Component {
    static navigationOptions = ({navigation}) => ({
        headerRight: (
            <TouchableOpacity style={{marginRight: 20}} onPress={() => navigation.navigate('New')}>
                <Image source={camera}/>
            </TouchableOpacity>
        ),
    });

    state = {
        feed: [],
    };

    async componentDidMount() {
        this.registerToSocket();

        const response = await api.get('posts');

        console.log(response.data);

        this.setState({feed: response.data});
    }

    registerToSocket = () => {
        const socket = io('http://192.168.1.5:3333');

        socket.on('post', newPost => {
            this.setState({feed: [newPost, ...this.state.feed]});
        });

        socket.on('like', likedPost => {
            this.setState({
                feed: this.state.feed.map(post =>
                    post._id === likedPost._id ? likedPost : post
                )
            });
        });
    };

    handleLike = id => {
        api.post(`posts/${id}/like`)
    };

    render() {
        return (
            <View style={style.container}>
                <FlatList
                    data={this.state.feed}
                    keyExtractor={post => post._id}
                    renderItem={({item}) => (
                        <View style={style.feedItem}>
                            <View style={style.feedItemHeader}>
                                <View style={style.userInfo}>
                                    <Text style={style.name}>{item.author}</Text>
                                    <Text style={style.place}>{item.place}</Text>
                                </View>

                                <Image source={more}></Image>
                            </View>

                            <Image style={style.feedImage} source={{uri: `http://192.168.1.5:3333/files/${item.image}`}}/>

                            <View style={style.feedItemFooter}>
                                <View style={style.actions}>
                                    <TouchableOpacity style={style.actions} onPress={() => this.handleLike(item._id)}>
                                        <Image source={like} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={style.actions} onPress={() => {}}>
                                        <Image source={comment} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={style.actions} onPress={() => {}}>
                                        <Image source={send} />
                                    </TouchableOpacity>
                                </View>

                                <Text style={style.likes}>{item.likes} curtidas</Text>
                                <Text style={style.description}>{item.description}</Text>
                                <Text style={style.hashtags}>{item.hashtags}</Text>
                            </View>
                        </View>
                    )}
                />

            </View>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,

    },

    feedItem: {
        marginTop: 20
    },

    feedItemHeader: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    name: {
        fontSize: 14,
        color: '#000',
    },

    place: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },

    feedImage: {
        width: '100%',
        height: 400,
        marginVertical: 15,
    },

    feedItemFooter: {
        paddingHorizontal: 15,
    },

    actions: {
        flexDirection: 'row',
    },

    action: {
        marginRight: 8,
    },

    likes: {
        marginTop: 15,
        fontWeight: 'bold',
        color: '#000',
    },

    description: {
        lineHeight: 18,
        color: '#000',
    },

    hastags: {
        color: '#7159c1',
    }
});

export default Feed;