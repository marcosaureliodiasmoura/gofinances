import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import {
  Container, Header, UserWrapper,
  UserInfo, Photo, User, UserGreeting, UserName, Icon, HighlightCards, Transactions, Title,
  TransactionList, LogoutButton,
} from './styles';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

export function Dashboard() {
  const [data, setData] = useState<DataListProps[]>([]);

  async function loadTransactions() {
    const datakey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(datakey);
    const transactions = response ? JSON.parse(response) : [];

   const transactionsFormatted: DataListProps[] = transactions
   .map((item: DataListProps) =>{
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

   setData(transactionsFormatted);

  }

  useEffect(() => {
    loadTransactions();
  }, [])

  useFocusEffect(useCallback(() => {
    loadTransactions();
  },[]));

  return (
    <Container>
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
          amount="R$ 17.400,00"
          lastTransaction="Última entrada dia 13 de abril"
          type="up"
        />
        <HighlightCard
          title="Saídas"
          amount="R$ 1.259,00"
          lastTransaction="Última saída dia 03 de abril"
          type="down"
        />
        <HighlightCard
          title="Total"
          amount="R$ 16.141,00"
          lastTransaction="01 à 16 de abril"
          type="total"
        />
      </HighlightCards>

      <Transactions>
        <Title>Listagem</Title>

        <TransactionList
          data={data}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <TransactionCard data={item} />}
        />


      </Transactions>

    </Container>
  )
}