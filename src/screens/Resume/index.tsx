import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryCard } from '../../components/HistoryCard';

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
  total: string;
  color: string;
}


import {
  Container,
  Header,
  Title,
  Content,
} from './styles';
import { categories } from '../../utils/categories';

export function Resume() {
  const [totalByCategories, setotalByCategories] = useState<CategoryDataProps[]>([]);

  async function loadData() {
    const datakey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(datakey);
    const responseFormatted = response ? JSON.parse(response) : [];

    // console.log(responseFormatted);
    const expensives = responseFormatted.filter
      ((expensive: TransactionDataProps) => expensive.type === 'negative')

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
        const total = categorySum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total,
        })
      }
    })
    // console.log(totalByCategory)
    setotalByCategories(totalByCategory);

  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>

      <Content>
        {
          totalByCategories.map(item => (
            <HistoryCard
              key={item.key}
              title={item.name}
              amount={item.total}
              color={item.color}
            />
          ))

        }
      </Content>
    </Container>
  )
}