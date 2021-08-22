# MMM-GarathSensors

A [MagicMirror] module to display values from my home sensor experiements.

Currently, the module pulls Govee sensor data from a custom API. See [garath/Govee] for more details.

## Installation

Clone this repository into the MagicMirror `modules/` directory.

```bash
cd MagicMirror/modules
git clone https://github.com/garath/MMM-GarathSensors.git
```

Then, enable the module in the MagicMirror `config.js`.

```jsonc
{
  "modules": [
    {
      "module": "MMM-GarathSensors",
      "header": "Govee Sensors",
      "position": "top_right",
      "config": {
    },
  ]
}
```

## Configuration

The module requires some configuration.

- `apiUrl`: The full and proper URL to the sensor API
- `addressNameMap`: An array of objects with `address` and `name` properties. This maps the sensor address to a human-friendly name for display.
- `indoorAddress`: If defined, any sensor matching this address will be parsed and broadcast as `INDOOR_TEMPERATURE` and `INDOOR_HUMIDITY` events to other MagicMirror modules (see the ["weather" default module]).

[MagicMirror]: https://github.com/MichMich/MagicMirror
[garath/Govee]: https://github.com/garath/Govee
["weather" default module]: https://docs.magicmirror.builders/modules/weather.html