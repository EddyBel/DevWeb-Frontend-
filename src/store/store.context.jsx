import { createContext, useEffect, useState } from 'react';
import { getAboutMe, getExperience, getProyects } from '../api/api';
import { validateObjectsNotNull, validateValues } from '../utils/validations';

export const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [information, setInformation] = useState();
  const user = {
    avatar: 'https://avatars.githubusercontent.com/u/111319309?v=4',
    userName: 'EddyBel',
    userNameProfile: '@eddybel',
    userPosition: 'Full-Stack Developer',
    description:
      'Desarrollador full-stack con pasión por los videojuegos. Me encanta crear experiencias interactivas y divertidas para los usuarios.',
    hashtag: '#AmazingCode',
    github: 'https://github.com/EddyBel',
    linkedin: 'https://www.linkedin.com/in/eduardo-rangel-eddybel/',
    status: true,
  };
  const localRef = 'info';

  /** Realiza las peticiones a la API */
  async function getApi() {
    // Realiza todas las peticiones
    const responseAboutMe = await getAboutMe();
    const responseExperience = await getExperience();
    const responseProyects = await getProyects();

    if (validateValues(responseAboutMe, responseExperience, responseProyects)) {
      // Extrae el contenido de las peticiones
      const aboutMeContent = responseAboutMe?.data;
      const experienceContent = responseExperience?.data;
      const proyectsContent = responseProyects?.data;

      if (validateValues(aboutMeContent, experienceContent, proyectsContent)) {
        // Filtra algunos datos
        let aboutMe = [];
        aboutMeContent?.map((item) => {
          if (item.name === 'Sobre mi') aboutMe = item?.information?.split('\n');
        });

        // Crea el objeto de la información
        const information = {
          aboutMe,
          experience: experienceContent,
          proyects: proyectsContent,
        };

        //   Crea el local storage
        localStorage.setItem(localRef, JSON.stringify({ data: information, date: new Date().getTime() }));
        setInformation(information);
      }
    }
  }

  /**
   * Esta función solicita la información en caso de que no tenga un estado previamente guardado.
   * - Si no existe un storage guardado previamente entonces realiza la petición al servidor.
   * - Si existe un storage guardado previamente entonces valdida que haya pasado mas de una semana para renovar ls datos
   * - Actualiza el estado local de la apliacion para que la aplicacion pueda acceder a los datos
   */
  const getDataInCaheOrAPI = async () => {
    const cache = localStorage.getItem(localRef);
    if (cache) {
      const cacheData = JSON.parse(cache);
      const cacheDate = cacheData.date;
      const cacheContent = cacheData.data;
      const date = new Date().getTime();
      const diference = (date - cacheDate) / (1000 * 60 * 60 * 24 * 7);

      if (diference > 1) getApi();
      else if (!validateValues(cacheContent)) getApi();
      else if (!validateObjectsNotNull(cacheContent)) getApi();
      else setInformation(cacheContent);
    } else getApi();
  };

  /** Ejecución inicial al arrancar la web */
  useEffect(() => {
    getDataInCaheOrAPI();
  }, []);

  const values = {
    user,
    information,
  };

  return <StoreContext.Provider value={values}>{children}</StoreContext.Provider>;
}
