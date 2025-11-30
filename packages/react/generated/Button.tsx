import React from 'react';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
interface Button {
  buttonBgColor: string;
  buttonContent: string;
  children?: React.ReactNode;
}

export const Button = (props: Button) => (
  <Container styleMap={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: props.buttonBgColor, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, cursor: "pointer", minWidth: 120, minHeight: 44 }}><Text styleMap={{ color: "#ffffff", fontSize: 16, fontWeight: "600", textAlign: "center" }} data={{ content: props.buttonContent }}>{props.buttonContent}</Text>{props.children}</Container>
);
