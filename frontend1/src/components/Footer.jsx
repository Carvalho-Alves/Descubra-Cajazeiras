import React from 'react';
import './Footer.css';

const Footer = ({ texto }) => {
  return (
    <footer className="footer">
      <p className="footer-texto">{texto}</p>
    </footer>
  );
};

export default Footer;