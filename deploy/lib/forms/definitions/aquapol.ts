import type { FormDefinition } from '../types';

const yesNoOptions = [
  { value: 'yes', label: 'Igen' },
  { value: 'no', label: 'Nem' },
];

export const aquapolFormDefinition: FormDefinition = {
  id: 'aquapol-form',
  title: 'Aquapol űrlap',
  description:
    'Az Aquapol nedvességcsökkentő rendszer telepítéséhez szükséges alapinformációk összegyűjtése.',
  pdf: {
    fileName: 'aquapol-felmeres',
    template: 'aquapol',
  },
  sections: [
    {
      id: 'customer',
      title: 'Személyes adatok',
      columns: 2,
      fields: [
        {
          id: 'customer_name',
          type: 'text',
          label: 'Megrendelő neve',
          placeholder: 'Név',
          width: 'half',
          required: true,
        },
        {
          id: 'customer_address',
          type: 'text',
          label: 'Lakcím / Irányítószám',
          placeholder: 'Cím, irányítószám',
          width: 'half',
        },
        {
          id: 'customer_phone',
          type: 'text',
          label: 'Telefon',
          placeholder: '+36 ...',
          width: 'half',
        },
        {
          id: 'customer_mobile',
          type: 'text',
          label: 'Mobil',
          placeholder: '+36 ...',
          width: 'half',
        },
        {
          id: 'customer_email',
          type: 'text',
          label: 'E-mail',
          placeholder: 'nev@example.com',
          width: 'half',
        },
        {
          id: 'contact_person',
          type: 'text',
          label: 'Kapcsolattartó',
          placeholder: 'Kapcsolattartó neve',
          width: 'half',
        },
        {
          id: 'contact_person_phone',
          type: 'text',
          label: 'Telefon (kapcsolattartó)',
          placeholder: '+36 ...',
          width: 'half',
        },
      ],
    },
    {
      id: 'installation',
      title: 'Ahová az AQUAPOL® készüléket telepíteni kívánja',
      columns: 2,
      fields: [
        {
          id: 'installation_name',
          type: 'text',
          label: 'Név',
          placeholder: 'Telepítési hely neve',
          width: 'half',
        },
        {
          id: 'installation_phone',
          type: 'text',
          label: 'Telefon',
          placeholder: '+36 ...',
          width: 'half',
        },
        {
          id: 'installation_address',
          type: 'text',
          label: 'Cím / Irányítószám',
          placeholder: 'Telepítési cím',
          width: 'full',
        },
      ],
    },
    {
      id: 'building',
      title: 'Az épületről',
      columns: 2,
      fields: [
        {
          id: 'house_built_year',
          type: 'text',
          label: '12. Mikor épült a ház',
          placeholder: 'Év',
          width: 'half',
        },
        {
          id: 'house_floor_area',
          type: 'text',
          label: '13. Mekkora az alapterülete',
          placeholder: 'm²',
          width: 'half',
        },
        {
          id: 'main_wall_thickness',
          type: 'text',
          label: '14. Főfalak vastagsága',
          placeholder: 'cm',
          width: 'half',
        },
        {
          id: 'partition_wall_thickness',
          type: 'text',
          label: '15. Közfalak vastagsága',
          placeholder: 'cm',
          width: 'half',
        },
        {
          id: 'basement_exists',
          type: 'radio',
          label: '16. Van-e pince a ház alatt?',
          options: yesNoOptions,
          width: 'half',
        },
        {
          id: 'basement_area',
          type: 'text',
          label: '17. Hány m² alapterületű a pince',
          placeholder: 'm²',
          width: 'half',
          visibleWhen: {
            fieldId: 'basement_exists',
            equals: ['yes'],
          },
        },
        {
          id: 'basement_depth',
          type: 'text',
          label: '18. A pince mélysége a föld szintjéhez képest',
          placeholder: 'cm',
          width: 'half',
          visibleWhen: {
            fieldId: 'basement_exists',
            equals: ['yes'],
          },
        },
        {
          id: 'basement_height_above_ground',
          type: 'text',
          label: '19. A föld szintje feletti pincemagasság',
          placeholder: 'cm',
          width: 'half',
          visibleWhen: {
            fieldId: 'basement_exists',
            equals: ['yes'],
          },
        },
        {
          id: 'basement_lateral_moisture',
          type: 'radio',
          label: '20. Van-e oldalirányú nedvesedésre utaló jel a pincében?',
          options: yesNoOptions,
          width: 'half',
          visibleWhen: {
            fieldId: 'basement_exists',
            equals: ['yes'],
          },
        },
        {
          id: 'floor_height_without_basement',
          type: 'text',
          label:
            '21. Ha nincs pince az épület alatt, mekkora a padlószint magassága a járdaszinthez képest',
          placeholder: 'cm',
          width: 'full',
          visibleWhen: {
            fieldId: 'basement_exists',
            equals: ['no'],
          },
        },
        {
          id: 'house_material',
          type: 'text',
          label: '22. Milyen építőanyagból készült a ház',
          width: 'full',
        },
        {
          id: 'last_renovation',
          type: 'text',
          label: '23. Mikor volt utoljára tatarozva',
          width: 'half',
        },
        {
          id: 'last_paint',
          type: 'text',
          label: '24. Festve',
          width: 'half',
        },
        {
          id: 'dampness_after_time',
          type: 'text',
          label: '25. Mennyi időt múlva jelentkezett a nedvesedés',
          width: 'half',
        },
        {
          id: 'dampness_after_paint',
          type: 'text',
          label: '26. Festés után',
          width: 'half',
        },
        {
          id: 'salt_efflorescence',
          type: 'radio',
          label: '27. Látható-e sókicsapódás a falon?',
          options: yesNoOptions,
          width: 'half',
        },
        {
          id: 'mold_present',
          type: 'radio',
          label: '28. Penész?',
          options: yesNoOptions,
          width: 'half',
        },
        {
          id: 'mold_location',
          type: 'text',
          label: '29. A penész a falak alsó felén vagy a mennyezeti részen jelentkezik',
          width: 'full',
          visibleWhen: {
            fieldId: 'mold_present',
            equals: ['yes'],
          },
        },
        {
          id: 'mold_behind_furniture',
          type: 'radio',
          label: '30. Csak a bútorok mögött',
          options: yesNoOptions,
          width: 'half',
          visibleWhen: {
            fieldId: 'mold_present',
            equals: ['yes'],
          },
        },
        {
          id: 'air_musty',
          type: 'radio',
          label: '31. Dohos, nyirkos a levegő a lakásban',
          options: yesNoOptions,
          width: 'half',
        },
        {
          id: 'terrain_type',
          type: 'select',
          label: '32. Az építmény terepviszonyai',
          options: [
            { value: 'plain', label: 'Síkság' },
            { value: 'riverside', label: 'Folyópart' },
            { value: 'slope', label: 'Lejtő' },
          ],
          width: 'half',
        },
        {
          id: 'gutter_condition',
          type: 'text',
          label: '33. Esőcsatorna állapota',
          width: 'half',
        },
        {
          id: 'sidewalk_building',
          type: 'radio',
          label:
            '34. Épül-e járda az épület köré, ami a fal tövéről indul és elvezeti a felcsapódó vizeket?',
          options: yesNoOptions,
          width: 'half',
        },
        {
          id: 'rainwater_drainage_resolved',
          type: 'radio',
          label:
            '35. Megoldódott-e az esővíz kifolyónyílásánál a vízelvezetés a falakról?',
          options: yesNoOptions,
          width: 'half',
        },
        {
          id: 'winter_condensation',
          type: 'radio',
          label:
            '36. Télen intenzív fűtés mellett páralecsapódást észlel-e a falakon?',
          options: yesNoOptions,
          width: 'half',
        },
        {
          id: 'wall_moisture_height_main',
          type: 'text',
          label: '37. A falakon látható falnedvesség magassága (cm a főfalon)',
          placeholder: 'cm',
          width: 'half',
        },
        {
          id: 'wall_moisture_height_partition',
          type: 'text',
          label: 'cm a közbenső falon',
          placeholder: 'cm',
          width: 'half',
        },
        {
          id: 'floor_deformation',
          type: 'radio',
          label: '38. Deformálódik-e a padlózat a nedvesség hatására?',
          options: yesNoOptions,
          width: 'half',
        },
        {
          id: 'incorrect_execution_dampness',
          type: 'radio',
          label:
            '39. Helytelen kivitelezésből adódó nedvesedés, eresz, WC, fürdőszoba, konyha, egyéb',
          options: yesNoOptions,
          width: 'half',
        },
        {
          id: 'incorrect_execution_details',
          type: 'textarea',
          label: '39. Részletek (ha Igen)',
          placeholder: 'Rövid leírás',
          width: 'full',
          visibleWhen: {
            fieldId: 'incorrect_execution_dampness',
            equals: ['yes'],
          },
        },
        {
          id: 'additional_observations',
          type: 'textarea',
          label: '40. Egyéb észrevételei amit lényegesnek tart',
          placeholder: 'Szabad szöveg',
          width: 'full',
        },
        {
          id: 'calculation_notes',
          type: 'textarea',
          label: '41. Kalkuláció',
          placeholder: 'Szabad szöveges mező',
          width: 'full',
        },
      ],
    },
  ],
};

export default aquapolFormDefinition;
