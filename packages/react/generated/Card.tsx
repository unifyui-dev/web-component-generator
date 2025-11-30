import React from 'react';
import { Container } from '../components/Container';
import { Image } from '../components/Image';
import { Text } from '../components/Text';
interface Card {
  cardButtonBgColor: string;
  cardButtonText: string;
  cardDescription: string;
  cardImageSrc: string;
  cardTitle: string;
}

export const Card = (props: Card) => (
  <Container styleMap={{ display: "flex", flexDirection: "column", backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#e0e0e0", overflow: "hidden", maxWidth: 400, shadowColor: "#000000", shadowOffsetX: 0, shadowOffsetY: 2, shadowRadius: 8, shadowOpacity: 0.1, elevation: 2 }}><Image styleMap={{ width: "100%", height: 200 }} data={{ src: props.cardImageSrc }}></Image><Container styleMap={{ display: "flex", flexDirection: "column", padding: 20, gap: 12 }}><Text styleMap={{ fontSize: 24, fontWeight: "700", color: "#333333", marginBottom: 4 }} data={{ content: props.cardTitle }}>{props.cardTitle}</Text><Text styleMap={{ fontSize: 14, color: "#666666", lineHeight: 1.5 }} data={{ content: props.cardDescription }}>{props.cardDescription}</Text><Container styleMap={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", marginTop: 8 }}><Container styleMap={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: props.cardButtonBgColor, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 6, cursor: "pointer" }}><Text styleMap={{ color: "#ffffff", fontSize: 14, fontWeight: "600" }} data={{ content: props.cardButtonText }}>{props.cardButtonText}</Text></Container></Container></Container></Container>
);
