import React from 'react';
import { Container } from '../components/Container';
import { Text } from '../components/Text';
import './Button.css';
interface Button {
  styleMap: {
    "--button-bg-color": string;
  };
  data: {
    buttonContent: string;
  };
  children?: React.ReactNode;
}

export const Button = (props: Button) => (
  <Container style={{ "--button-bg-color": props.styleMap?.["--button-bg-color"] }} className="button-root"><Text className="button-root-container-0" data={{ content: props.data?.buttonContent }}>{props.data?.buttonContent}</Text>{props.children}</Container>
);
