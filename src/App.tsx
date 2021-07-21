import * as React from "react";
import "./App.css";
import axios from "axios";
import Home from "./components/home";
import { About } from "./components/about";
import { Rsvp } from "./components/rsvp";
import { Footer } from "./components/footer";
import { Invitation } from "./components/invitation";
import { Events } from "./components/events";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { IUser, Languages } from "./components/interfaces";

const AppInternal: React.FunctionComponent<{}> = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const id = queryParams.get("id");
  const lang = queryParams.get("lang") as Languages;
  const floofValue = queryParams.get("floof") ? true : false;

  const fetchUser = (id: any) => {
    if (!!id) {
      return axios
        .get(`https://wedding-cristina-alex.ew.r.appspot.com/api/rsvp/${id}`)
        .then((res) => res.data);
    }
    return undefined;
  };

  const { data } = useQuery("user", () => fetchUser(id));

  const [language, setLanguage] = React.useState<Languages>(
    lang || Languages.ro
  );
  const [invitationRsvp, setRsvp] = React.useState<IUser | undefined>(data);
  const [floof] = React.useState<boolean>(floofValue);

  React.useEffect(() => {
    if ((data as IUser) && (data as IUser).id && (data as IUser).language) {
      setLanguage(data.language);
      setRsvp({
        ...data,
        accommodationStartDate:
          data.accommodationStartDate && new Date(data.accommodationStartDate),
        accommodationEndDate:
          data.accommodationEndDate && new Date(data.accommodationEndDate),
      });
    }
  }, [data]);
  return (
    <div className="App">
      <Home language={language} showRsvp={!!invitationRsvp} />
      <About language={language} floof={floof} />
      <Invitation
        language={language}
        greeting={invitationRsvp?.greeting}
        plural={
          !invitationRsvp?.isPlural &&
          invitationRsvp &&
          invitationRsvp?.guests.filter((guest) => guest.isComming).length <= 1
            ? false
            : true
        }
      />
      <Events language={language} />
      {invitationRsvp && (
        <Rsvp language={language} rsvp={invitationRsvp} setRsvp={setRsvp} />
      )}
      <Footer language={language} />
    </div>
  );
};

const queryClient = new QueryClient();

export const App: React.FunctionComponent<{}> = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInternal />
    </QueryClientProvider>
  );
};
