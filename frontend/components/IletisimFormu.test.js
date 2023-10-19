import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "@testing-library/user-event";
import IletisimFormu from "./IletisimFormu";

beforeEach(() => {
  render(<IletisimFormu />);
});

test("hata olmadan render ediliyor", () => {
  expect(screen.getByText("İletişim Formu")).toBeVisible();
});

test("iletişim formu headerı render ediliyor", () => {
  const formHeader = screen.getByRole("heading", { level: 1 });
  expect(formHeader).toBeInTheDocument();
});

test("kullanıcı adını 5 karakterden az girdiğinde BİR hata mesajı render ediyor.", async () => {
  const adInput = screen.getByLabelText("Ad*");
  userEvent.type(adInput, "test");
  await waitFor(() => {
    const errors = screen.getAllByTestId("error");
    expect(errors).toHaveLength(1);

    expect(
      screen.getByText(/Ad en az 5 karakter olmalıdır/i)
    ).toBeInTheDocument();
  });
});

test("kullanıcı inputları doldurmadığında ÜÇ hata mesajı render ediliyor.", async () => {
  const submitBtn = screen.getByRole("button");
  userEvent.click(submitBtn);
  await waitFor(() => {
    expect(screen.getAllByTestId("error")).toHaveLength(3);
  });
});

test("kullanıcı doğru ad ve soyad girdiğinde ama email girmediğinde BİR hata mesajı render ediliyor.", async () => {
  const adInput = screen.getByLabelText("Ad*");
  userEvent.type(adInput, "abcde");
  const soyadInput = screen.getByPlaceholderText("Mansız");
  userEvent.type(soyadInput, "x");
  const submitBtn = screen.getByRole("button");
  userEvent.click(submitBtn);
  await waitFor(() => {
    expect(screen.getAllByTestId("error")).toHaveLength(1);
  });
});

test('geçersiz bir mail girildiğinde "email geçerli bir email adresi olmalıdır." hata mesajı render ediliyor', async () => {
  const emailInput = screen.getByLabelText("Email*");
  userEvent.type(emailInput, "abcde");
  const mesajEmalHata = new RegExp("geçerli bir email adresi olmalıdır.", "i");
  await waitFor(() => {
    expect(screen.getByText(mesajEmalHata)).toBeInTheDocument();
  });
});

test('soyad girilmeden gönderilirse "soyad gereklidir." mesajı render ediliyor', async () => {
  const submitBtn = screen.getByRole("button");
  userEvent.click(submitBtn);
  const soyadError = new RegExp("soyad gerekli", "i");
  await waitFor(() => {
    expect(screen.getByText(soyadError)).toBeInTheDocument();
  });
  const soyadInput = screen.getByPlaceholderText("Mansız");
  userEvent.type(soyadInput, "x");
  const errors = screen.getAllByTestId("error");
  expect(errors).toHaveLength(2);
});

test("ad,soyad, email render ediliyor. mesaj bölümü doldurulmadığında hata mesajı render edilmiyor.", async () => {
  const adInput = screen.getByLabelText("Ad*");
  userEvent.type(adInput, "abcde");
  const soyadInput = screen.getByPlaceholderText("Mansız");
  userEvent.type(soyadInput, "x");
  const emailInput = screen.getByLabelText("Email*");
  userEvent.type(emailInput, "abcde@abcde.com");
  const submitBtn = screen.getByRole("button");
  userEvent.click(submitBtn);

  await waitFor(() => {
    expect(screen.queryAllByTestId("error")).toHaveLength(0);
  });
});

test("form gönderildiğinde girilen tüm değerler render ediliyor.", async () => {
  const adInput = screen.getByLabelText("Ad*");
  userEvent.type(adInput, "abcde");
  const soyadInput = screen.getByPlaceholderText("Mansız");
  userEvent.type(soyadInput, "x");
  const emailInput = screen.getByLabelText("Email*");
  userEvent.type(emailInput, "abcde@abcde.com");
  const mesajInput = screen.getByLabelText("Mesaj");
  userEvent.type(mesajInput, "abcde");

  const formElement = screen.getByTestId("form");

  await waitFor(() => {
    expect(formElement).toHaveFormValues({
      ad: "abcde",
      soyad: "x",
      email: "abcde@abcde.com",
      mesaj: "abcde",
    });
  });

  const submitBtn = screen.getByRole("button");
  userEvent.click(submitBtn);

  await waitFor(() => {
    expect(screen.getByTestId("firstnameDisplay")).toHaveTextContent("abcde");
    expect(screen.getByTestId("lastnameDisplay")).toHaveTextContent("x");
    expect(screen.getByTestId("emailDisplay")).toHaveTextContent(
      "abcde@abcde.com"
    );
    expect(screen.getByTestId("messageDisplay")).toHaveTextContent("abcde");
  });
});
