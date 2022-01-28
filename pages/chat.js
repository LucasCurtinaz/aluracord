import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import React from "react";
import appConfig from "../config.json";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzMyMDAzMCwiZXhwIjoxOTU4ODk2MDMwfQ.pUYeuSVdEayOBUEUBDWoQtPDAOqefPecQDn7Y-uE2pU";
const SUPABASE_URL = "https://fgnfjnchuatmpxmiqblz.supabase.co";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function ChatPage() {
  const [mensagem, setMensagem] = React.useState("");
  const [listaDeMensagens, setListaDeMensagens] = React.useState([]);
  const roteamento = useRouter();

  function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
      .from("chat")
      .on("INSERT", (respostaLive) => {
        adicionaMensagem(respostaLive.new);
      })
      .subscribe();
  }

  React.useEffect(() => {
    supabaseClient
      .from("chat")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data }) => {
        setListaDeMensagens(data);
      });

    escutaMensagensEmTempoReal((novaMensagem) => {
      setListaDeMensagens((valorAtualDaLista) => {
        return [novaMensagem, ...valorAtualDaLista];
      });
    });
  }, []);

  function handleNovaMensagem(novaMensagem) {
    const mensagem = {
      // id: listaDeMensagens.length + 1,
      de: roteamento.query.name,
      texto: novaMensagem,
    };
    supabaseClient
      .from("chat")
      .insert([mensagem])
      .then(({ data }) => {
        // setListaDeMensagens([data[0], ...listaDeMensagens]);
      });

    setMensagem("");
  }

  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          <MessageList
            mensagens={listaDeMensagens}
            setListaDeMensagens={(novasMensagens) =>
              setListaDeMensagens(novasMensagens)
            }
          />
          {/* Lista de mensagens:
          {listaDeMensagens.map((mensagemAtual) => {
            return (
              <li key={mensagemAtual.id}>
                {mensagemAtual.de}: {mensagemAtual.texto}
              </li>
            );
          })} */}
          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextField
              value={mensagem}
              onChange={(event) => {
                const valor = event.target.value;
                setMensagem(valor);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (mensagem) {
                    handleNovaMensagem(mensagem);
                  }
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <Box
              styleSheet={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <ButtonSendSticker
                onStickerClick={(sticker) => {
                  handleNovaMensagem(`:sticker:${sticker}`);
                }}
              />
              <Button
                onClick={() => {
                  if (mensagem) {
                    handleNovaMensagem(mensagem);
                  }
                }}
                type="button"
                label={
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/2/24/Arrow-right-512.png" />
                }
                buttonColors={{
                  contrastColor: appConfig.theme.colors.neutrals["000"],
                  mainColor: appConfig.theme.colors.primary[500],
                  mainColorLight: appConfig.theme.colors.primary[400],
                  mainColorStrong: appConfig.theme.colors.primary[600],
                }}
                styleSheet={{
                  width: "3.125rem",
                  height: "3.125rem",
                  borderRadius: "50%",
                  margin: "0 0 0.5rem 0",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">Chat</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  function handleExcluirMensagem(id) {
    const newMessages = props.mensagens.filter((i) => i.id !== id);
    props.setListaDeMensagens(newMessages);
  }

  return (
    <Box
      tag="ul"
      styleSheet={{
        overflowY: "auto",
        display: "flex",
        flexDirection: "column-reverse",
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
        maxHeight: "100%",
      }}
    >
      {props.mensagens.map((mensagem) => {
        return (
          <Text
            key={mensagem.id}
            tag="li"
            styleSheet={{
              borderRadius: "5px",
              padding: "6px",
              marginBottom: "12px",
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Box
                styleSheet={{
                  marginBottom: "8px",
                }}
              >
                <Image
                  styleSheet={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    display: "inline-block",
                    marginRight: "8px",
                  }}
                  src={`https://github.com/${mensagem.de}.png`}
                />
                <Text tag="strong">{mensagem.de}</Text>
                <Text
                  styleSheet={{
                    fontSize: "10px",
                    marginLeft: "8px",
                    color: appConfig.theme.colors.neutrals[300],
                  }}
                  tag="span"
                >
                  {new Date().toLocaleDateString()}
                </Text>
              </Box>
              {/* <Button
                onClick={() => handleExcluirMensagem(mensagem.id)}
                type="button"
                label="x"
                buttonColors={{
                  contrastColor: appConfig.theme.colors.neutrals["000"],
                  mainColor: appConfig.theme.colors.primary["500"],
                }}
                styleSheet={{
                  width: "0.5rem",
                  height: "1.5rem",
                  color: "black",
                }}
              /> */}
            </Box>
            {mensagem.texto.startsWith(":sticker:") ? (
              <Image
                src={mensagem.texto.replace(":sticker:", "")}
                styleSheet={{
                  maxWidth: "200px",
                }}
              />
            ) : (
              mensagem.texto
            )}
          </Text>
        );
      })}
    </Box>
  );
}
