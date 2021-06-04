import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import {
  Container, Header, UserWrapper,
  UserInfo, Photo, User, UserGreeting, UserName, Icon, HighlightCards, Transactions, Title,
  TransactionList, LogoutButton, LoadContainer
} from './styles';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
}

interface HighlightDataProps {
  entries: HighlightProps;
  expensive: HighlightProps;
  total: HighlightProps;
}

export function Dashboard() {
  const [isLoading, setisLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [hightlightData, sethightlightData] = useState<HighlightDataProps>({} as HighlightDataProps); //Começa sendo vazio desse tipo aqui

  const theme = useTheme();

  async function loadTransactions() {
    const datakey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(datakey);
    const transactions = response ? JSON.parse(response) : [];


    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions
      .map((item: DataListProps) => {

        if (item.type === 'positive') {
          entriesTotal += Number(item.amount);
        } else {
          expensiveTotal += Number(item.amount);
        }

        const amount = Number(item.amount)
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });

        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date
        }
      });

    setTransactions(transactionsFormatted);

    



    const total = entriesTotal - expensiveTotal;
    sethightlightData({
      entries: {
        amount: entriesTotal
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
      },
      expensive: {
        amount: expensiveTotal
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
      },
      total: {
        amount: total
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })
      },

    });

    // console.log(transactionsFormatted);
    setisLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, [])

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, []));

  return (
    <Container>
     {
       isLoading ? 
       <LoadContainer>
         <ActivityIndicator 
         color={theme.colors.primary}
         size="large"
         />
       </LoadContainer>
       :

        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{ uri: 'https://scontent.frec20-1.fna.fbcdn.net/v/t1.6435-9/192969752_2469870169825683_2364681660341539451_n.jpg?_nc_cat=109&ccb=1-3&_nc_sid=730e14&_nc_ohc=DV8ypPxsfTMAX-Qx9x8&_nc_ht=scontent.frec20-1.fna&oh=3885c47bf37363fe2dfe8625f0677219&oe=60D77252' }} />
                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>Marcos</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={() => { }}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              title="Entradas"
              amount={hightlightData.entries.amount}
              lastTransaction="Última entrada dia 13 de abril"
              type="up"
            />
            <HighlightCard
              title="Saídas"
              amount={hightlightData.expensive.amount}
              lastTransaction="Última saída dia 03 de abril"
              type="down"
            />
            <HighlightCard
              title="Total"
              amount={hightlightData.total.amount}
              lastTransaction="01 à 16 de abril"
              type="total"
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionList
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />


          </Transactions>
        </>
      }
    </Container>
  )
}