import React from "react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export const Desktop = (): JSX.Element => {
  // Data for cause buttons
  const causeButtons = [
    {
      color: "bg-[#ffad3a]",
      icon: "/pata.png",
      alt: "Pata",
      iconClasses: "w-[35px] h-[35px]",
    },
    {
      color: "bg-[#fe86a4]",
      icon: "/fem.png",
      alt: "Fem",
      iconClasses: "w-[35px] h-[52px]",
    },
    {
      color: "bg-[#4992da]",
      icon: "/autismo-1.png",
      alt: "Autismo",
      iconClasses: "w-9 h-14",
    },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        {/* Hero Section */}
        <section className="relative w-full h-[557px]">
          <div className="bg-[#5f713f0d] w-full h-full absolute top-0 left-0" />

          {/* Wave decorations */}
          <div className="absolute w-full h-80 top-0 left-0 overflow-hidden rotate-180">
            <div className="relative h-[358px]">
              <img
                className="absolute w-full h-64 top-[102px] left-0 -rotate-180"
                alt="Vector"
                src="/vector.svg"
              />
              <img
                className="absolute w-full h-[259px] top-0 left-0 -rotate-180"
                alt="Wave"
                src="/wave--4--1.svg"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="absolute top-[92px] left-0 w-full flex justify-between items-center px-16">
            <img
              className="w-[22px] h-[22px]"
              alt="Nav bar"
              src="/nav-bar.svg"
            />
            <div className="flex gap-4">
              <Button className="h-10 bg-[#3f734d] text-white rounded font-normal text-xl">
                Entrar
              </Button>
              <Button className="h-10 bg-[#dd604a] text-white rounded font-normal text-xl">
                Faça sua conta
              </Button>
            </div>
          </div>

          {/* Hero Content */}
          <div className="absolute top-[265px] left-[131px]">
            <h1 className="font-['Merriweather',Helvetica] font-light text-black text-5xl">
              Não sabe onde doar?
            </h1>
            <h2 className="font-['Merriweather',Helvetica] font-bold text-[#3f734d] text-5xl mt-2">
              A gente te ajuda!
            </h2>

            <Button className="mt-10 w-[219px] h-[55px] bg-[#dd604a] rounded-[1px] text-white font-['Montserrat',Helvetica] font-bold text-xl">
              Saiba mais!
              <img
                className="ml-2 w-[18px] h-[19px]"
                alt="Setinha"
                src="/setinha.svg"
              />
            </Button>
          </div>
        </section>

        {/* Find NGO Section */}
        <section className="relative w-full h-[557px] bg-[#f4eee9]">
          <div className="flex flex-row justify-between items-center px-24 py-16">
            <div className="max-w-[560px]">
              <h2 className="font-['Merriweather',Helvetica] font-light text-[#183419] text-5xl mb-10">
                Ache a ong mais próxima da sua casa!
              </h2>
              <p className="font-['Montserrat',Helvetica] font-normal text-black text-xl">
                Nós iremos ajudar você a fazer uma grande ação pelo menor
                caminho. Encontre a ong mais próxima da sua casa com{" "}
                <span className="font-semibold text-[#db592a]">
                  poucos cliques!
                </span>
              </p>
            </div>

            <Card className="w-[409px] h-[404px] bg-[#d9d9d9] rounded-[5px]" />
          </div>
        </section>

        {/* Donation Section */}
        <section className="relative w-full h-[557px]">
          <img
            className="absolute w-full h-full left-0 top-0"
            alt="Filtro azul"
            src="/filtro-azul.svg"
          />

          <div className="flex flex-row justify-between items-center px-24 py-16 relative z-10">
            <div className="flex flex-col gap-4">
              {causeButtons.map((button, index) => (
                <Button
                  key={index}
                  className={`w-[352px] h-[62px] ${button.color} rounded flex items-center justify-start pl-10`}
                >
                  <img
                    className={`${button.iconClasses} object-cover`}
                    alt={button.alt}
                    src={button.icon}
                  />
                </Button>
              ))}
            </div>

            <div className="max-w-[623px]">
              <h2 className="font-['Merriweather',Helvetica] font-light text-[#183419] text-5xl mb-10">
                Sua doação com a sua cara!
              </h2>
              <p className="font-['Montserrat',Helvetica] font-normal text-black text-xl max-w-[560px]">
                Escolha a causa que mais combine com você, filtre suas opções
                para achar algo mais especifico
              </p>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <section className="w-full h-[557px] bg-[#f4eee9]">
          {/* Footer content would go here */}
        </section>
      </div>
    </div>
  );
};
