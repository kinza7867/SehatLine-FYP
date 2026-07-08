import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../../theme';

import DoctorPortalScreen from '../DoctorPortalScreen';
import DoctorProfileScreen from '../DoctorProfileScreen';
import DoctorNotificationsScreen from '../DoctorNotificationsScreen';
import DoctorSettingsScreen from '../DoctorSettingsScreen';


const Tab = createBottomTabNavigator();



export default function DoctorBottomTabNavigator() {

  return (

    <Tab.Navigator

      initialRouteName="DoctorPortal"

      screenOptions={({ route }) => ({

        headerShown:false,


        tabBarActiveTintColor: COLORS.primary,

        tabBarInactiveTintColor:'#9CA3AF',


        tabBarStyle:{

          height:68,

          paddingBottom:8,

          paddingTop:8,

          backgroundColor:'#FFFFFF',

          borderTopWidth:1,

          borderTopColor:'#E5E7EB',

        },


        tabBarLabelStyle:{

          fontSize:11,

          fontWeight:'600',

        },


        tabBarIcon:({color,size})=>{


          let iconName;


          switch(route.name){


            case 'DoctorPortal':

              iconName='home-outline';

              break;



            case 'DoctorNotifications':

              iconName='notifications-outline';

              break;



            case 'DoctorProfile':

              iconName='person-circle-outline';

              break;



            case 'DoctorSettings':

              iconName='settings-outline';

              break;



            default:

              iconName='ellipse-outline';

          }



          return (

            <Ionicons

              name={iconName}

              size={size}

              color={color}

            />

          );


        },


      })}


    >



      <Tab.Screen

        name="DoctorPortal"

        component={DoctorPortalScreen}

        options={{

          title:'Home',

        }}

      />





      <Tab.Screen

        name="DoctorNotifications"

        component={DoctorNotificationsScreen}

        options={{

          title:'Alerts',

        }}

      />





      <Tab.Screen

        name="DoctorProfile"

        component={DoctorProfileScreen}

        options={{

          title:'Profile',

        }}

      />





      <Tab.Screen

        name="DoctorSettings"

        component={DoctorSettingsScreen}

        options={{

          title:'Settings',

        }}

      />




    </Tab.Navigator>


  );

}