import donation_data from "./donation_data";
import initiator_data from "./initiator_data";
import initiator_book_data from "./initiator_book";

const startDate = new Date("2025-03-01");
const finishDate = new Date("2025-06-01");
const startDateBook = new Date("2025-05-01");
const finishDateBook = new Date("2025-06-01");
const msPerDay = 24 * 60 * 60 * 1000;
let totalDonation = 0;
const donationLimit = initiator_data[0].donationLimit;
const bookDonationLimit = initiator_book_data[0].donationLimit;
const bookType = initiator_book_data[0].book_type;
const totalDonationBook = 0;

const totalUserDonate = donation_data.length;

const totalDays = Math.floor(
  (finishDate.getTime() - startDate.getTime()) / msPerDay
);
const currentDate = new Date();
const elapsedDays = Math.floor(
  (currentDate.getTime() - startDate.getTime()) / msPerDay
);

const totalDaysBook = Math.floor(
  (finishDateBook.getTime() - startDateBook.getTime()) / msPerDay
);
const currentDateBook = new Date();
const elapsedDaysBook = Math.floor(
  (currentDateBook.getTime() - startDateBook.getTime()) / msPerDay
);
const progressCompletedBook = Math.max(
  0,
  Math.min(elapsedDaysBook, totalDaysBook)
);

const progressCompleted = Math.max(0, Math.min(elapsedDays, totalDays));
for (let i = 0; i < donation_data.length; i++) {
  totalDonation += donation_data[i].amount;
}

export {
  totalDonation,
  totalUserDonate,
  totalDonationBook,
  bookType,
  bookDonationLimit,
  progressCompletedBook,
  elapsedDays,
  totalDaysBook,
  currentDateBook,
  elapsedDaysBook,
  progressCompleted,
  totalDays,
  donationLimit,
  initiator_data,
  donation_data,
};
