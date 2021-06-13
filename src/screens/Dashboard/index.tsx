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
import { LastTransaction } from '../../components/HighlightCard/styles';
import { useAuth } from '../../hooks/auth';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
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
  const { signOut, user } = useAuth();

  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative') {

    const lastTransactionDate = new Date(
      Math.max.apply(Math, collection
        .filter((transaction) => transaction.type === type)
        .map((transaction) => new Date(transaction.date).getTime())))

    return `${lastTransactionDate.getDate()} de ${lastTransactionDate.toLocaleString('pt-BR', { month: 'long' })}`;

    // console.log(lasTransactionsEntries); // show all transactions
    // console.log(new Date(lasTransactionsEntries)); // Trás a  as datas

  }

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

    const lastTransactionsEntries = getLastTransactionDate(transactions, 'positive')
    const lastTransactionsExpensives = getLastTransactionDate(transactions, 'negative')
    const totalInterval = `01 a ${lastTransactionsExpensives}`;

    const total = entriesTotal - expensiveTotal;

    sethightlightData({
      entries: {
        amount: entriesTotal
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
        lastTransaction: `Última entrada dia ${lastTransactionsEntries}`,
      },
      expensive: {
        amount: expensiveTotal
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
        lastTransaction: `Última saída dia ${lastTransactionsExpensives}`,
      },
      total: {
        amount: total
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }),
        lastTransaction: totalInterval,
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
                    source={{ uri: user.photo }} />
                  <User>
                    <UserGreeting>Olá,</UserGreeting>
                    <UserName>{user.name}</UserName>
                  </User>
                </UserInfo>

                <LogoutButton onPress={signOut}>
                  <Icon name="power" />
                </LogoutButton>
              </UserWrapper>
            </Header>

            <HighlightCards>
              <HighlightCard
                title="Entradas"
                amount={hightlightData.entries.amount}
                lastTransaction={hightlightData.entries.lastTransaction}
                type="up"
              />
              <HighlightCard
                title="Saídas"
                amount={hightlightData.expensive.amount}
                lastTransaction={hightlightData.expensive.lastTransaction}
                type="down"
              />
              <HighlightCard
                title="Total"
                amount={hightlightData.total.amount}
                lastTransaction={hightlightData.total.lastTransaction}
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