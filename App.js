import { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';


// Pagrindinis aplikacijos komponentas
const DriftApp = ({ navigation }) => {
  const [leagueData, setLeagueData] = useState([]);

//Duomenų paėmimas
  useEffect(() => {
    const data = require('./duomenys.json');
    setLeagueData(data);
  }, []);

  const openLeague = (league) => {
    navigation.navigate('DALYVIAI', { league });
  };

//Lygų mygtukai
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Lietuvos Drifto Čempionatas</Text>
      </View>
      <Text style={styles.subHeaderText}>Lygos</Text>
      {leagueData.map((league) => (
        <TouchableOpacity
          key={league.league_id}
          onPress={() => openLeague(league)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{`${league.league_title} lyga`}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

//Lygos ekranas
const LeagueDetailsScreen = ({ navigation }) => {
  const league = navigation.getParam('league');
  const [participants, setParticipants] = useState(league.drivers || []);

  useEffect(() => {
    const sortedParticipants = navigation.getParam('sortedParticipants');
    if (sortedParticipants) {
      setParticipants(sortedParticipants);
    }
  }, [navigation]);

  //Taškų apskaičiavimas
  const calculateSeasonPoints = (participant) => {
    return participant.race.reduce(
      (total, race) => total + race.qualification_points + race.tandem_points,
      0
    );
  };

  //Rikiavimas pagal abėcėlę
  const sortAlphabetically = (participants) => {
    return participants.sort((a, b) => {
      const aName = `${a.firstname} ${a.lastname}`;
      const bName = `${b.firstname} ${b.lastname}`;
      return aName.localeCompare(bName, 'lt', { sensitivity: 'base' });
    });
  };

  //Rikiavimas pagal taškus
  const sortParticipants = (criteria) => {
    let sortedParticipants;

    if (criteria === 'alphabetical') {
      sortedParticipants = sortAlphabetically([...participants]);
    } else if (criteria === 'points') {
      sortedParticipants = [...participants].sort(
        (a, b) => calculateSeasonPoints(b) - calculateSeasonPoints(a)
      );
    }

    setParticipants(sortedParticipants);
  };

//Rūšiavimo ir dalyvių mygtukai
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subHeaderText}>{league.league_title} lygos dalyviai</Text>

      <TouchableOpacity onPress={() => sortParticipants('alphabetical')} style={styles.button}>
        <Text style={styles.buttonText}>Rikiuoti pagal abėcėlę</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => sortParticipants('points')} style={styles.button}>
        <Text style={styles.buttonText}>Rikiuoti pagal taškus</Text>
      </TouchableOpacity>
      {participants.map((participant) => (
        <TouchableOpacity
          key={participant.driver_id}
          onPress={() =>
            navigation.navigate('INFORMACIJA', {
              participant,
              seasonPoints: calculateSeasonPoints(participant),
            })
          }
          style={styles.participantButton}
        >
          <Text style={styles.buttonText}>{`${participant.firstname} ${participant.lastname} - ${participant.car}`}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

//Dalyvių ekranas
const ParticipantDetailsScreen = ({ navigation }) => {
  const participant = navigation.getParam('participant');
  const seasonPoints = navigation.getParam('seasonPoints');
  const races = participant.race || [];

//Dalyvių info
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subHeaderText}>{participant.firstname} {participant.lastname}</Text>
      <Text style={styles.buttonText}>Automobilis: {participant.car}</Text>
      <Text style={styles.buttonText}>Surinkti taškai: {seasonPoints}</Text>
      <Text style={styles.subHeaderText}>Dalyvavimas etapuose:</Text>
      {races.map((race) => (
        <View key={race.race_id} style={styles.raceInfo}>
          <Text style={styles.buttonText}>{race.race_information}</Text>
          <Text style={styles.buttonText}>Qualification Points: {race.qualification_points}</Text>
          <Text style={styles.buttonText}>Tandem Points: {race.tandem_points}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

// Stiliai
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#373B69',
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subHeaderText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    borderColor: '#00A878',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00A878',
    marginVertical: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  participantButton: {
    marginTop: 10,
    width: '100%',
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00A878',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#373B69',
    marginVertical: 5,
  },
  raceInfo: {
    marginVertical: 10,
    borderColor: '#00A878',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
  },
});

// Navigacijos modelis
const AppNavigator = createStackNavigator(
  {
    PAGRINDINIS: DriftApp,
    DALYVIAI: LeagueDetailsScreen,
    INFORMACIJA: ParticipantDetailsScreen,
  },
  {
    initialRouteName: 'PAGRINDINIS',
  }
);

export default createAppContainer(AppNavigator);


