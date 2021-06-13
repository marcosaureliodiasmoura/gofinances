import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryCard } from '../../components/HistoryCard';
import { VictoryPie } from 'victory-native';
import {useFocusEffect} from '@react-navigation/native';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTheme } from 'styled-components/native';
import { useAuth } from '../../hooks/auth';

import { categories } from '../../utils/categories';
import { RFValue } from 'react-native-responsive-fontsize';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer,
} from './styles';

interface TransactionDataProps {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryDataProps {
  key: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  // percentFormatted: string;
  percent: string;
}

export function Resume() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setotalByCategories] = useState<CategoryDataProps[]>([]);

  const theme = useTheme();
  const {user} = useAuth();

  function handleChangeDate(action: 'next' | 'prev') {

    if (action === 'next') {
      setSelectedDate(addMonths(selectedDate, 1));

    } else {
      setSelectedDate(subMonths(selectedDate, 1))
    }
  }

  async function loadData() {
    setIsLoading(true);

    const datakey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(datakey);
    const responseFormatted = response ? JSON.parse(response) : [];

    // console.log(responseFormatted);
    const expensives = responseFormatted
      .filter((expensive: TransactionDataProps) =>
        expensive.type === 'negative' &&
        new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
        new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
      );


    const expensivesTotal = expensives
      .reduce((accumulator: number, expensive: TransactionDataProps) => {
        return accumulator + Number(expensive.amount);
      }, 0);


    const totalByCategory: CategoryDataProps[] = [];

    // diferente do map vou percorrer os dados e não irei utilizá-los para mostrar em tela
    categories.forEach(category => {
      let categorySum = 0; //Percorro cada categoria

      //Percorro todos os gastos verificando se a categoria do gasto é a mesma 
      //Da chave da categoria que estou percorrendo
      expensives.forEach((expensive: TransactionDataProps) => {
        if (expensive.category === category.key) {
          categorySum += Number(expensive.amount);
        }
      });

      if (categorySum > 0) {
        const totalFormatted = categorySum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })

        // const percent = (categorySum / expensivesTotal * 100);
        // const percentFormatted = `${percent.toFixed(0)}%`

        const percent = `${(categorySum / expensivesTotal * 100).toFixed(0)}%`

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total: categorySum,
          totalFormatted,
          percent,
          // percentFormatted
        })
      }
    })
    console.log(totalByCategory)
    setotalByCategories(totalByCategory);
    setIsLoading(false);

  }
 
  useFocusEffect(useCallback(() => {
    loadData();
  },[selectedDate]));

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>

      {
        isLoading ?
          <LoadContainer>
            <ActivityIndicator
              color={theme.colors.primary}
              size="large"
            />
          </LoadContainer>
          :
          <Content
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: useBottomTabBarHeight(),
            }}
          >
            <MonthSelect>
              <MonthSelectButton onPress={() => handleChangeDate('prev')}>
                <MonthSelectIcon name="chevron-left" />
              </MonthSelectButton>

              <Month>{format(selectedDate, 'MMMM, yyyy', { locale: ptBR })}</Month>

              <MonthSelectButton onPress={() => handleChangeDate('next')}>
                <MonthSelectIcon name="chevron-right" />
              </MonthSelectButton>
            </MonthSelect>

            <ChartContainer>
              <VictoryPie
                data={totalByCategories}
                colorScale={totalByCategories.map(category => category.color)}
                style={{
                  labels: {
                    fontSize: RFValue(18),
                    fontWeigth: "bold",
                    fill: theme.colors.shape
                  }
                }}
                labelRadius={50}
                x="percent"
                y="total"
              />
            </ChartContainer>

            {
              totalByCategories.map(item => (
                <HistoryCard
                  key={item.key}
                  title={item.name}
                  amount={item.totalFormatted}
                  color={item.color}
                />
              ))
            }
          </Content >
      }
    </Container >
  )
}