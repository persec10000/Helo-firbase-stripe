// import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
// import { createStackNavigator } from '@react-navigation/stack';
import { createStackNavigator } from 'react-navigation-stack';
import StartScreen from "@screens/AuthStack/Start";
import LoginScreen from "@screens/AuthStack/Login";
import RegisterScreen from "@screens/AuthStack/Register";
import RegisterNextStepScreen from "@screens/AuthStack/RegisterNextStep";

const snavigator = createStackNavigator(
	{
		Start: {
			screen: StartScreen
		},
		LoginScreen: {
			screen: LoginScreen
		},
		Register: {
			screen: RegisterScreen
		},
		RegisterNextStepScreen: {
			screen: RegisterNextStepScreen
		}
	},
	{
		initialRouteName: 'Start',
	}
)

const GuestNavigation = createAppContainer(snavigator);
export default GuestNavigation;