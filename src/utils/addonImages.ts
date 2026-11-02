const images = {
  additionalChair: '/addons/additional-chair.jpg',
  catering: '/addons/catering.jpg',
  extensionCable: '/addons/extension-cable.jpg',
  extraFlipchart: '/addons/extra-flipchart.jpg',
  extraMicrophone: '/addons/extra-microphone.jpg',
  flipchart: '/addons/flipchart.jpg',
  lanCable: '/addons/lan-cable.jpg',
  lunchBox: '/addons/lunch-box.jpg',
  podium: '/addons/podium.jpg',
  portableSpeaker: '/addons/portable-speaker.jpg',
  portableWhiteboard: '/addons/portable-whiteboard.jpg',
  projector: '/addons/projector-screen.jpg',
  registrationDesk: '/addons/registration-desk.jpg',
  soundSystem: '/addons/sound-system.jpg',
  videoConference: '/addons/video-conference-kit.jpg',
  wifi: '/addons/wifi-router.jpg',
  wirelessMicrophone: '/facilities/Wireless Microphone.jpg',
  wirelessPresenter: '/addons/wireless-presenter.jpg',
  afternoonCatering: '/packages/Afternoon Coffee Break.jpg',
  lunch: '/packages/Lunch.jpg',
  furniture:
    'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
  meeting:
    'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=900&q=80',
  event:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
}

export function getAddonImageUrl(name: string, category?: string | null): string {
  const searchText = `${category ?? ''} ${name}`.toLowerCase()

  if (/extra flipchart/.test(searchText)) {
    return images.extraFlipchart
  }
  if (/portable whiteboard/.test(searchText)) {
    return images.portableWhiteboard
  }
  if (/kursi tambahan|additional chair/.test(searchText)) {
    return images.additionalChair
  }
  if (/registration desk/.test(searchText)) {
    return images.registrationDesk
  }
  if (/video conference/.test(searchText)) {
    return images.videoConference
  }
  if (/extra microphone/.test(searchText)) {
    return images.extraMicrophone
  }
  if (/portable speaker/.test(searchText)) {
    return images.portableSpeaker
  }
  if (/lunch box/.test(searchText)) {
    return images.lunchBox
  }
  if (/lunch buffet|buffet|lunch/.test(searchText)) {
    return images.lunch
  }
  if (/afternoon/.test(searchText)) {
    return images.afternoonCatering
  }
  if (/coffee|food|catering|makan/.test(searchText)) {
    return images.catering
  }
  if (/wireless microphone|microphone|microphone extra|mic/.test(searchText)) {
    return images.wirelessMicrophone
  }
  if (/wireless presenter|presenter/.test(searchText)) {
    return images.wirelessPresenter
  }
  if (/projector|video conference/.test(searchText)) {
    return images.projector
  }
  if (/speaker|audio|sound/.test(searchText)) {
    return images.soundSystem
  }
  if (/extension cable/.test(searchText)) {
    return images.extensionCable
  }
  if (/lan cable|ethernet|network/.test(searchText)) {
    return images.lanCable
  }
  if (/wi-?fi|router/.test(searchText)) {
    return images.wifi
  }
  if (/podium|lectern/.test(searchText)) {
    return images.podium
  }
  if (/flipchart|whiteboard/.test(searchText)) {
    return images.flipchart
  }
  if (/chair|kursi|furniture|desk|meja/.test(searchText)) {
    return images.furniture
  }
  if (/event|ballroom|stage/.test(searchText)) {
    return images.event
  }

  return images.meeting
}
