import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';

import { LinearGradient } from 'expo-linear-gradient';

import Ionicons from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../../theme';

import DoctorBottomTabNavigator from './DoctorBottomTabNavigator';

import TodayQueueScreen from '../TodayQueueScreen';
import ConsultationScreen from '../ConsultationScreen';
import PatientHistoryScreen from '../PatientHistoryScreen';
import PrescriptionScreen from '../PrescriptionScreen';
import PrescriptionTemplatesScreen from '../PrescriptionTemplatesScreen';
import DoctorScheduleScreen from '../DoctorScheduleScreen';

import HelpSupportScreen from '../../settings/HelpSupportScreen';



const Drawer = createDrawerNavigator();



const DoctorDrawerContent = ({navigation}) => {


const [doctor,setDoctor] = useState({

name:'Dr. Ahmed Hassan',
specialty:'Cardiologist',
hospital:'CDA Hospital Islamabad'

});



useEffect(()=>{

loadDoctor();

},[]);



const loadDoctor = async()=>{

try{

const data = await AsyncStorage.getItem('userData');


if(data){

const user = JSON.parse(data);


setDoctor({

name:user.name || 'Doctor',

specialty:user.specialty || 'General Physician',

hospital:user.hospital || 'CDA Hospital'

});


}


}

catch(error){

console.log(error);

}


};




const logout = ()=>{


Alert.alert(

"Logout",

"Are you sure you want to logout?",

[

{
text:"Cancel",
style:"cancel"
},


{

text:"Logout",

style:"destructive",

onPress:async()=>{


await AsyncStorage.multiRemove([

'user',
'userData',
'isLoggedIn',
'userRole'

]);



navigation.reset({

index:0,

routes:[

{
name:'Login'
}

]

});


}

}


]


);


};





return(


<View style={styles.container}>


<LinearGradient

colors={[COLORS.primary,COLORS.secondary]}

style={styles.header}


>


<Image

source={require('../../../../assets/logo.png')}

style={styles.logo}

/>



<Text style={styles.name}>

{doctor.name}

</Text>



<Text style={styles.speciality}>

{doctor.specialty}

</Text>



<Text style={styles.hospital}>

{doctor.hospital}

</Text>



<View style={styles.onlineContainer}>


<View style={styles.dot}/>


<Text style={styles.onlineText}>
Online
</Text>


</View>



</LinearGradient>





<DrawerContentScrollView>



<DrawerItem

label="Doctor Portal"

icon={({color,size})=>(

<Ionicons name="home-outline" size={size} color={color}/>

)}

onPress={()=>navigation.navigate('DoctorHome')}

/>




<DrawerItem

label="Today's Queue"

icon={({color,size})=>(

<Ionicons name="people-outline" size={size} color={color}/>

)}

onPress={()=>navigation.navigate('TodayQueue')}

/>





<DrawerItem

label="Consultation"

icon={({color,size})=>(

<Ionicons name="medkit-outline" size={size} color={color}/>

)}

onPress={()=>navigation.navigate('Consultation')}

/>





<DrawerItem

label="Patient History"

icon={({color,size})=>(

<Ionicons name="document-text-outline" size={size} color={color}/>

)}

onPress={()=>navigation.navigate('PatientHistory')}

/>





<DrawerItem

label="Prescription"

icon={({color,size})=>(

<Ionicons name="create-outline" size={size} color={color}/>

)}

onPress={()=>navigation.navigate('Prescription')}

/>





<DrawerItem

label="Prescription Templates"

icon={({color,size})=>(

<Ionicons name="albums-outline" size={size} color={color}/>

)}

onPress={()=>navigation.navigate('PrescriptionTemplates')}

/>





<DrawerItem

label="Schedule"

icon={({color,size})=>(

<Ionicons name="calendar-outline" size={size} color={color}/>

)}

onPress={()=>navigation.navigate('DoctorSchedule')}

/>





<DrawerItem

label="Help & Support"

icon={({color,size})=>(

<Ionicons name="help-circle-outline" size={size} color={color}/>

)}

onPress={()=>navigation.navigate('HelpSupport')}

/>





<DrawerItem

label="Logout"

labelStyle={{

color:COLORS.danger,

fontWeight:'700'

}}

icon={({size})=>(

<Ionicons

name="log-out-outline"

size={size}

color={COLORS.danger}

/>

)}

onPress={logout}

/>



</DrawerContentScrollView>



<View style={styles.footer}>


<Text style={styles.version}>

SehatLine Doctor Portal

</Text>


<Text style={styles.version2}>

Version 1.0

</Text>


</View>



</View>


);


};






export default function DoctorDrawerNavigator(){


return(

<Drawer.Navigator


drawerContent={(props)=>(

<DoctorDrawerContent {...props}/>

)}


screenOptions={{

headerShown:false,

drawerStyle:{

width:300

}

}}


>



<Drawer.Screen

name="DoctorHome"

component={DoctorBottomTabNavigator}

/>




<Drawer.Screen

name="TodayQueue"

component={TodayQueueScreen}

/>




<Drawer.Screen

name="Consultation"

component={ConsultationScreen}

/>




<Drawer.Screen

name="PatientHistory"

component={PatientHistoryScreen}

/>




<Drawer.Screen

name="Prescription"

component={PrescriptionScreen}

/>




<Drawer.Screen

name="PrescriptionTemplates"

component={PrescriptionTemplatesScreen}

/>




<Drawer.Screen

name="DoctorSchedule"

component={DoctorScheduleScreen}

/>




<Drawer.Screen

name="HelpSupport"

component={HelpSupportScreen}

/>



</Drawer.Navigator>


);


}






const styles = StyleSheet.create({


container:{

flex:1,

backgroundColor:'#fff'

},


header:{

paddingVertical:40,

paddingHorizontal:20,

alignItems:'center'

},



logo:{

width:80,

height:80,

borderRadius:40,

marginBottom:15

},



name:{

fontSize:18,

fontWeight:'700',

color:'#fff'

},



speciality:{

fontSize:14,

color:'#fff',

marginTop:5

},



hospital:{

fontSize:13,

color:'#eee',

marginTop:4

},



onlineContainer:{

flexDirection:'row',

alignItems:'center',

marginTop:12

},



dot:{

width:10,

height:10,

borderRadius:5,

backgroundColor:'#00ff88',

marginRight:6

},



onlineText:{

color:'#fff',

fontSize:13

},



footer:{

padding:20,

alignItems:'center'

},



version:{

fontWeight:'700',

color:COLORS.primary

},



version2:{

fontSize:12,

color:'#777',

marginTop:5

}


});