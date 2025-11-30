import React from 'react';
import { Container } from '../components/Container';
import { Image } from '../components/Image';
import { Text } from '../components/Text';
import './Card.css';
interface Card {
  styleMap: {
    "--card-button-bg-color": string;
  };
  data: {
    cardButtonText: string;
    cardDescription: string;
    cardImageSrc: string;
    cardTitle: string;
  };
  children?: React.ReactNode;
}

export const Card = (props: Card) => (
  <Container style={{ "--card-button-bg-color": props.styleMap?.["--card-button-bg-color"] }} className="card-root"><Image className="card-root-container-0" data={{ src: props.data?.cardImageSrc }}></Image><Container className="card-root-container-1"><Text className="card-root-container-1-container-0" data={{ content: props.data?.cardTitle }}>{props.data?.cardTitle}</Text><Text className="card-root-container-1-container-1" data={{ content: props.data?.cardDescription }}>{props.data?.cardDescription}</Text><Container className="card-root-container-1-container-2"><Container className="card-root-container-1-container-2-container-0"><Text className="card-root-container-1-container-2-container-0-container-0" data={{ content: props.data?.cardButtonText }}>{props.data?.cardButtonText}</Text></Container></Container></Container>{props.children}</Container>
);
