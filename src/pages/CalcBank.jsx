import { useState } from "react";
import { Container, Form, Button, Row, Col, Table, Card, Modal } from "react-bootstrap";
import { Calculator } from "react-bootstrap-icons";

const CalcBank = () => {
  const [principal, setPrincipal] = useState("");
  const [term, setTerm] = useState("");
  const [displayTerm, setDisplayTerm] = useState(""); // New state variable for display
  const [rate, setRate] = useState("");
  const [flatRateResult, setFlatRateResult] = useState(null);
  const [slidingRateResult, setSlidingRateResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChangePrincipal = (value) => {
    const formattedValue = value.replace(/\D/g, "");
    if (isNaN(formattedValue) || formattedValue === "") {
      setPrincipal(0);
      return;
    }
    setPrincipal(parseFloat(formattedValue));
  };

  const formatToRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
    }).format(angka);
  };

  const validateInputs = () => {
    if (!principal || !term || !rate) {
      setErrorMessage("Semua kolom harus diisi!");
      setShowModal(true);
      return false;
    }
    return true;
  };

  const calculateFlatRate = () => {
    if (!validateInputs()) return;

    const P = parseFloat(principal);
    const N = parseInt(term);
    const R = parseFloat(rate) / 100;

    const cicilanPokok = P / N;
    const bunga = (P * R) / 12;
    const totalBunga = bunga * N;
    const angsuranBulanan = bunga + cicilanPokok;
    const totalPembayaran = totalBunga + P;

    setFlatRateResult({ angsuranBulanan, totalBunga, totalPembayaran, bunga });
    setDisplayTerm(term); // Update display term here
  };

  const calculateSlidingRate = () => {
    if (!validateInputs()) return;

    const P = parseFloat(principal);
    const N = parseInt(term);
    const R = parseFloat(rate) / 100;

    let remainingPrincipal = P;
    let totalBunga = 0;
    let angsuranBulanan = [];

    for (let i = 1; i <= N; i++) {
      const bunga = (remainingPrincipal * R) / 12;
      const cicilanPokok = P / N;
      const angsuran = bunga + cicilanPokok;
      remainingPrincipal -= cicilanPokok;
      totalBunga += bunga;
      angsuranBulanan.push({ month: i, angsuran, bunga, totalAngsuranBulanan: angsuran });
    }

    const totalPembayaran = totalBunga + P;
    setSlidingRateResult({ angsuranBulanan, totalBunga, totalPembayaran });
    setDisplayTerm(term); // Update display term here
  };

  const calculateSumOfInstallments = (start, end) => {
    if (slidingRateResult) {
      return slidingRateResult.angsuranBulanan.filter((item) => item.month >= start && item.month <= end).reduce((sum, item) => sum + item.angsuran, 0);
    }
    return 0;
  };

  const sumOfInstallments = calculateSumOfInstallments(1, displayTerm);

  return (
    <Container className="my-5">
      <Card className="p-4 shadow-sm" style={{ backgroundColor: "#f8f9fa", borderColor: "#007bff" }}>
        <h1 className="text-center mb-4 text-primary">
          Kalkulator Perhitungan Kredit <Calculator />
        </h1>
        <Form>
          <Form.Group as={Row} controlId="principal">
            <Form.Label column sm={2} className="text-primary">
              Pinjaman Pokok
            </Form.Label>
            <Col sm={10}>
              <Form.Control type="text" value={principal.toLocaleString("en-US")} onChange={(e) => handleChangePrincipal(e.target.value)} placeholder="Masukkan pinjaman pokok" style={{ borderColor: "#28a745" }} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="term">
            <Form.Label column sm={2} className="text-primary">
              Jangka Waktu (bulan)
            </Form.Label>
            <Col sm={10}>
              <Form.Control type="number" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Masukkan jangka waktu dalam bulan" style={{ borderColor: "#28a745" }} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="rate">
            <Form.Label column sm={2} className="text-primary">
              Bunga Pinjaman (% per bulan)
            </Form.Label>
            <Col sm={10}>
              <Form.Control type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Masukkan bunga pinjaman" style={{ borderColor: "#28a745" }} />
            </Col>
          </Form.Group>
          <Row className="justify-content-center">
            <Button className="m-2" variant="success" onClick={calculateFlatRate}>
              Hitung Flat Rate
            </Button>
            <Button className="m-2" variant="success" onClick={calculateSlidingRate}>
              Hitung Sliding Rate
            </Button>
          </Row>
        </Form>
        {flatRateResult && (
          <Card className="mt-4 p-3">
            <h2 className="text-center text-primary">Hasil Flat Rate</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-primary">Total Bunga</th>
                  <th className="text-primary">Bunga</th>
                  <th className="text-primary">Angsuran Bulanan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{formatToRupiah(flatRateResult.totalBunga)}</td>
                  <td>{formatToRupiah(flatRateResult.bunga)}</td>
                  <td>{formatToRupiah(flatRateResult.angsuranBulanan)}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="text-primary">
                    Total Angsuran Bulanan (Bulan 1-{displayTerm})
                  </td>
                  <td>{formatToRupiah(flatRateResult.totalPembayaran)}</td>
                </tr>
              </tbody>
            </Table>
          </Card>
        )}
        {slidingRateResult && (
          <Card className="mt-4 p-3">
            <h2 className="text-center text-primary">Hasil Sliding Rate</h2>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-primary">Bulan</th>
                  <th className="text-primary">Bunga</th>
                  <th className="text-primary">Angsuran Bulanan</th>
                </tr>
              </thead>
              <tbody>
                {slidingRateResult.angsuranBulanan.map((item, index) => (
                  <tr key={index}>
                    <td>{item.month}</td>
                    <td>{formatToRupiah(item.bunga)}</td>
                    <td>{formatToRupiah(item.angsuran)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="2" className="text-primary">
                    Total Angsuran Bulanan (Bulan 1-{displayTerm})
                  </td>
                  <td>{formatToRupiah(sumOfInstallments)}</td>
                </tr>
              </tbody>
            </Table>
          </Card>
        )}
      </Card>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Peringatan</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowModal(false)}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CalcBank;
